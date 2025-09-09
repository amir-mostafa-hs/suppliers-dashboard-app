# Frontend - API Integration

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [API Integration Overview](#api-integration-overview)
- [Axios Configuration](#axios-configuration)
- [API Client Architecture](#api-client-architecture)
- [Authentication Integration](#authentication-integration)
- [Error Handling](#error-handling)
- [Request Interceptors](#request-interceptors)
- [Response Processing](#response-processing)
- [API Hooks with React Query](#api-hooks-with-react-query)
- [File Upload Management](#file-upload-management)
- [Cache Invalidation Strategies](#cache-invalidation-strategies)
- [Offline Support](#offline-support)
- [API Testing Strategies](#api-testing-strategies)

---

## API Integration Overview

The Suppliers Dashboard frontend uses a comprehensive API integration strategy built on Axios for HTTP client functionality and React Query for server state management. This architecture provides robust error handling, request/response transformation, authentication integration, and optimal caching strategies.

### Core Integration Principles

- **Type Safety**: Full TypeScript integration with API contracts
- **Centralized Configuration**: Single source for API configuration
- **Error Resilience**: Comprehensive error handling and retry logic
- **Authentication Flow**: Seamless JWT token management
- **Performance Optimization**: Request deduplication and caching
- **Developer Experience**: Rich debugging and development tools

### Backend API Endpoints

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT Bearer tokens
- **API Versioning**: v1 (implicit in base URL)
- **Response Format**: Standardized JSON responses

---

## Axios Configuration

### Base Axios Instance

```typescript
// lib/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_BASE_URL } from "@/config/secret-variable";

// Create base axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Include cookies for session management
});

// Response data structure interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response interface
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp: string;
}
```

### Request Interceptors

```typescript
// Request interceptor for authentication and logging
apiClient.interceptors.request.use(
  (config) => {
    // Add authentication token
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    // Log request in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
        {
          headers: config.headers,
          data: config.data,
          params: config.params,
        }
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);
```

### Response Interceptors

```typescript
// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Calculate request duration
    const duration =
      new Date().getTime() - response.config.metadata?.startTime?.getTime();

    // Log response in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ API Response: ${response.config.method?.toUpperCase()} ${
          response.config.url
        }`,
        {
          status: response.status,
          duration: `${duration}ms`,
          data: response.data,
        }
      );
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ API Error: ${originalRequest?.method?.toUpperCase()} ${
          originalRequest?.url
        }`,
        {
          status: error.response?.status,
          message: error.response?.data?.message,
          data: error.response?.data,
        }
      );
    }

    // Handle 401 Unauthorized - Token refresh or redirect to login
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshResponse = await apiClient.post("/auth/refresh");
        const newToken = refreshResponse.data.data.token;

        localStorage.setItem("auth_token", newToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("auth_token");
        window.location.href = "/auth/login";
      }
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.response?.status === 403) {
      // Could redirect to access denied page or show modal
      console.warn("Access denied - insufficient permissions");
    }

    // Handle 429 Too Many Requests - Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      if (retryAfter && !originalRequest._rateLimitRetry) {
        originalRequest._rateLimitRetry = true;

        // Wait and retry
        await new Promise((resolve) =>
          setTimeout(resolve, parseInt(retryAfter) * 1000)
        );
        return apiClient(originalRequest);
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error - please check your connection";
    }

    return Promise.reject(error);
  }
);
```

---

## API Client Architecture

### Base API Service Class

```typescript
// lib/api/base-api.ts
export abstract class BaseApiService {
  protected client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  protected async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  protected async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // File upload helper
  protected async uploadFile<T>(
    url: string,
    file: File | FileList,
    additionalData?: Record<string, any>,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    if (file instanceof FileList) {
      Array.from(file).forEach((f) => formData.append("files", f));
    } else {
      formData.append("file", file);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      });
    }

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });

    return response.data;
  }

  // Download file helper
  protected async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}
```

### Authentication API Service

```typescript
// lib/api/auth-api.ts
interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface User {
  id: number;
  email: string;
  role: "USER" | "SUPPLIER" | "ADMIN";
  createdAt: string;
  emailVerified: boolean;
}

interface AuthResponse {
  user: User;
  token: string;
  expiresIn: number;
}

class AuthApiService extends BaseApiService {
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/login", credentials);
  }

  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    return this.post<AuthResponse>("/auth/register", data);
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.post<void>("/auth/logout");
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.get<User>("/auth/me");
  }

  async refreshToken(): Promise<
    ApiResponse<{ token: string; expiresIn: number }>
  > {
    return this.post<{ token: string; expiresIn: number }>("/auth/refresh");
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.post<void>("/auth/forgot-password", { email });
  }

  async resetPassword(
    token: string,
    password: string,
    confirmPassword: string
  ): Promise<ApiResponse<void>> {
    return this.post<void>("/auth/reset-password", {
      token,
      password,
      confirmPassword,
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return this.post<void>("/auth/verify-email", { token });
  }

  async resendVerification(): Promise<ApiResponse<void>> {
    return this.post<void>("/auth/resend-verification");
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<void>> {
    return this.put<void>("/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  }
}

export const authApi = new AuthApiService(apiClient);
```

### Admin API Service

```typescript
// lib/api/admin-api.ts
interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface SupplierApprovalData {
  notes?: string;
}

class AdminApiService extends BaseApiService {
  async getAllUsers(
    params?: GetUsersParams
  ): Promise<ApiResponse<UsersResponse>> {
    return this.get<UsersResponse>("/admin/users", { params });
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return this.get<User>(`/admin/users/${id}`);
  }

  async updateUserRole(
    id: string,
    role: "USER" | "SUPPLIER" | "ADMIN"
  ): Promise<ApiResponse<User>> {
    return this.put<User>(`/admin/users/${id}/role`, { role });
  }

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/admin/users/${id}`);
  }

  async approveSupplier(
    id: string,
    data?: SupplierApprovalData
  ): Promise<ApiResponse<User>> {
    return this.post<User>(`/admin/suppliers/${id}/approve`, data);
  }

  async rejectSupplier(
    id: string,
    data: { reason: string; notes?: string }
  ): Promise<ApiResponse<User>> {
    return this.post<User>(`/admin/suppliers/${id}/reject`, data);
  }

  async getSupplierDocuments(id: string): Promise<ApiResponse<Document[]>> {
    return this.get<Document[]>(`/admin/suppliers/${id}/documents`);
  }

  async downloadSupplierDocument(
    supplierId: string,
    documentId: string
  ): Promise<void> {
    return this.downloadFile(
      `/admin/suppliers/${supplierId}/documents/${documentId}/download`
    );
  }

  async getSystemStats(): Promise<
    ApiResponse<{
      totalUsers: number;
      totalSuppliers: number;
      pendingSuppliers: number;
      approvedSuppliers: number;
      rejectedSuppliers: number;
    }>
  > {
    return this.get("/admin/stats");
  }

  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<
    ApiResponse<{
      logs: AuditLog[];
      pagination: any;
    }>
  > {
    return this.get("/admin/audit-logs", { params });
  }
}

export const adminApi = new AdminApiService(apiClient);
```

### Supplier API Service

```typescript
// lib/api/supplier-api.ts
interface SupplierProfile {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  businessDescription: string;
  businessType: "corporation" | "llc" | "partnership" | "sole_proprietorship";
  yearEstablished: number;
  employeeCount: string;
  annualRevenue: string;
  references: Array<{
    companyName: string;
    contactName: string;
    email: string;
    phone: string;
    relationship: string;
  }>;
}

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
}

class SupplierApiService extends BaseApiService {
  async createProfile(data: SupplierProfile): Promise<ApiResponse<User>> {
    return this.post<User>("/supplier/profile", data);
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.get<User>("/supplier/profile");
  }

  async updateProfile(
    data: Partial<SupplierProfile>
  ): Promise<ApiResponse<User>> {
    return this.put<User>("/supplier/profile", data);
  }

  async uploadDocuments(files: FileList): Promise<ApiResponse<Document[]>> {
    return this.uploadFile<Document[]>("/supplier/documents", files);
  }

  async getDocuments(): Promise<ApiResponse<Document[]>> {
    return this.get<Document[]>("/supplier/documents");
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/supplier/documents/${documentId}`);
  }

  async downloadDocument(documentId: string, fileName?: string): Promise<void> {
    return this.downloadFile(
      `/supplier/documents/${documentId}/download`,
      fileName
    );
  }

  async getApplicationStatus(): Promise<
    ApiResponse<{
      status: "pending" | "approved" | "rejected";
      submittedAt: string;
      reviewedAt?: string;
      reviewNotes?: string;
      rejectionReason?: string;
    }>
  > {
    return this.get("/supplier/application-status");
  }

  async resubmitApplication(data?: {
    notes?: string;
    changes?: string;
  }): Promise<ApiResponse<void>> {
    return this.post("/supplier/resubmit", data);
  }
}

export const supplierApi = new SupplierApiService(apiClient);
```

---

## Authentication Integration

### Token Management

```typescript
// lib/api/token-manager.ts
class TokenManager {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly TOKEN_EXPIRY_KEY = "token_expiry";

  static setToken(token: string, expiresIn: number): void {
    localStorage.setItem(this.TOKEN_KEY, token);

    const expiryTime = Date.now() + expiresIn * 1000;
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static isTokenExpired(): boolean {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return true;

    return Date.now() > parseInt(expiry);
  }

  static clearTokens(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
  }

  static getTimeUntilExpiry(): number {
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiry) return 0;

    return Math.max(0, parseInt(expiry) - Date.now());
  }
}

// Auto-refresh token before expiry
export const setupTokenRefresh = () => {
  const checkAndRefresh = async () => {
    const timeUntilExpiry = TokenManager.getTimeUntilExpiry();

    // Refresh token 5 minutes before expiry
    if (timeUntilExpiry > 0 && timeUntilExpiry < 5 * 60 * 1000) {
      try {
        const response = await authApi.refreshToken();
        TokenManager.setToken(response.data.token, response.data.expiresIn);
      } catch (error) {
        console.error("Token refresh failed:", error);
        TokenManager.clearTokens();
        window.location.href = "/auth/login";
      }
    }
  };

  // Check every minute
  setInterval(checkAndRefresh, 60 * 1000);

  // Check immediately
  checkAndRefresh();
};
```

---

## Error Handling

### Centralized Error Handler

```typescript
// lib/api/error-handler.ts
export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export class ApiError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;
  public isApiError = true;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.statusCode = response.statusCode;
    this.errors = response.errors;
    this.name = "ApiError";
  }

  getFieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }

  hasFieldError(field: string): boolean {
    return Boolean(this.errors?.[field]?.length);
  }

  getAllFieldErrors(): Record<string, string> {
    if (!this.errors) return {};

    return Object.entries(this.errors).reduce((acc, [field, messages]) => {
      acc[field] = messages[0];
      return acc;
    }, {} as Record<string, string>);
  }
}

export const handleApiError = (error: any): ApiError => {
  if (error.isApiError) return error;

  if (error.response?.data) {
    return new ApiError(error.response.data);
  }

  if (error.request) {
    return new ApiError({
      success: false,
      message: "Network error - please check your connection",
      statusCode: 0,
    });
  }

  return new ApiError({
    success: false,
    message: error.message || "An unexpected error occurred",
    statusCode: 500,
  });
};
```

### Error Boundary Integration

```typescript
// components/ErrorBoundary.tsx
interface ApiErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: ApiError; resetError: () => void }>;
}

export const ApiErrorBoundary: React.FC<ApiErrorBoundaryProps> = ({
  children,
  fallback: Fallback,
}) => {
  return (
    <ErrorBoundary
      FallbackComponent={Fallback || DefaultApiErrorFallback}
      onError={(error, errorInfo) => {
        if (error instanceof ApiError) {
          console.error("API Error caught by boundary:", {
            message: error.message,
            statusCode: error.statusCode,
            errors: error.errors,
            errorInfo,
          });
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

const DefaultApiErrorFallback: React.FC<{
  error: ApiError;
  resetError: () => void;
}> = ({ error, resetError }) => {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-destructive">
          {error.statusCode >= 500 ? "Server Error" : "Request Error"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{error.message}</p>

        {error.errors && (
          <div className="space-y-2 mb-4">
            {Object.entries(error.errors).map(([field, messages]) => (
              <div key={field} className="text-sm">
                <span className="font-medium capitalize">{field}:</span>
                <ul className="list-disc list-inside ml-4">
                  {messages.map((message, index) => (
                    <li key={index} className="text-destructive">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        <Button onClick={resetError}>Try Again</Button>
      </CardContent>
    </Card>
  );
};
```

---

## API Hooks with React Query

### Query Hook Patterns

```typescript
// hooks/api/useUsers.ts
interface UseUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  enabled?: boolean;
}

export const useUsers = (params: UseUsersParams = {}) => {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ["users", queryParams],
    queryFn: () => adminApi.getAllUsers(queryParams),
    enabled,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error("Failed to fetch users:", error);
    },
  });
};

export const useUser = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => adminApi.getUserById(id),
    enabled: enabled && !!id,
    select: (data) => data.data,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Infinite query for large datasets
export const useInfiniteUsers = (params: Omit<UseUsersParams, "page">) => {
  return useInfiniteQuery({
    queryKey: ["users", "infinite", params],
    queryFn: ({ pageParam = 1 }) =>
      adminApi.getAllUsers({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.data.pagination;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => page.data.users),
      pageParams: data.pageParams,
    }),
  });
};
```

### Mutation Hook Patterns

```typescript
// hooks/api/useUserMutations.ts
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.createUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["users"]);
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateUserRole(id, role as any),
    onMutate: async ({ id, role }) => {
      // Optimistic update
      await queryClient.cancelQueries(["user", id]);
      const previousUser = queryClient.getQueryData(["user", id]);

      queryClient.setQueryData(["user", id], (old: any) => ({
        ...old,
        role,
      }));

      return { previousUser };
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousUser) {
        queryClient.setQueryData(["user", variables.id], context.previousUser);
      }

      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries(["user", id]);
      queryClient.invalidateQueries(["users"]);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: adminApi.deleteUser,
    onSuccess: (data, variables) => {
      // Remove from cache
      queryClient.removeQueries(["user", variables]);
      queryClient.setQueryData(["users"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((user: User) => user.id !== variables),
        };
      });

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: ApiError) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
```

---

## File Upload Management

### Upload Progress Tracking

```typescript
// hooks/api/useFileUpload.ts
interface UploadProgress {
  progress: number;
  loaded: number;
  total: number;
}

export const useSupplierDocumentUpload = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null
  );

  const uploadMutation = useMutation({
    mutationFn: (files: FileList) => {
      return supplierApi.uploadDocuments(files, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress({
            progress,
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-documents"]);
      toast({
        title: "Success",
        description: "Documents uploaded successfully",
      });
      setUploadProgress(null);
    },
    onError: (error: ApiError) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
      setUploadProgress(null);
    },
  });

  return {
    upload: uploadMutation.mutate,
    isUploading: uploadMutation.isLoading,
    uploadProgress,
    error: uploadMutation.error,
  };
};

// Usage in component
const DocumentUpload: React.FC = () => {
  const { upload, isUploading, uploadProgress } = useSupplierDocumentUpload();
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = () => {
    if (selectedFiles) {
      upload(selectedFiles);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Documents</Label>
          <Input
            type="file"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
          />
        </div>

        {uploadProgress && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress.progress}%</span>
            </div>
            <Progress value={uploadProgress.progress} />
            <div className="text-xs text-muted-foreground">
              {Math.round(uploadProgress.loaded / 1024)} KB of{" "}
              {Math.round(uploadProgress.total / 1024)} KB
            </div>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!selectedFiles || isUploading}>
          {isUploading ? "Uploading..." : "Upload Documents"}
        </Button>
      </CardContent>
    </Card>
  );
};
```

---

## Cache Invalidation Strategies

### Smart Cache Management

```typescript
// lib/api/cache-manager.ts
export class CacheManager {
  constructor(private queryClient: QueryClient) {}

  // Invalidate related queries after user operations
  invalidateUserQueries(userId?: string) {
    this.queryClient.invalidateQueries(["users"]);
    if (userId) {
      this.queryClient.invalidateQueries(["user", userId]);
    }
    this.queryClient.invalidateQueries(["stats"]);
  }

  // Invalidate supplier-related queries
  invalidateSupplierQueries(supplierId?: string) {
    this.queryClient.invalidateQueries(["suppliers"]);
    this.queryClient.invalidateQueries(["users"]); // Users include supplier data
    if (supplierId) {
      this.queryClient.invalidateQueries(["supplier", supplierId]);
      this.queryClient.invalidateQueries(["supplier-documents", supplierId]);
    }
    this.queryClient.invalidateQueries(["stats"]);
  }

  // Update user in multiple cache locations
  updateUserInCache(userId: string, updates: Partial<User>) {
    // Update single user cache
    this.queryClient.setQueryData(
      ["user", userId],
      (old: ApiResponse<User>) => ({
        ...old,
        data: { ...old.data, ...updates },
      })
    );

    // Update user in users list
    this.queryClient.setQueryData(["users"], (old: any) => {
      if (!old?.data?.users) return old;
      return {
        ...old,
        data: {
          ...old.data,
          users: old.data.users.map((user: User) =>
            user.id === parseInt(userId) ? { ...user, ...updates } : user
          ),
        },
      };
    });
  }

  // Prefetch related data
  prefetchUserDetails(userId: string) {
    this.queryClient.prefetchQuery({
      queryKey: ["user", userId],
      queryFn: () => adminApi.getUserById(userId),
      staleTime: 1000 * 60 * 5,
    });
  }

  prefetchSupplierDocuments(supplierId: string) {
    this.queryClient.prefetchQuery({
      queryKey: ["supplier-documents", supplierId],
      queryFn: () => adminApi.getSupplierDocuments(supplierId),
      staleTime: 1000 * 60 * 2,
    });
  }

  // Clear all caches (useful for logout)
  clearAllCaches() {
    this.queryClient.clear();
  }
}

// Hook to use cache manager
export const useCacheManager = () => {
  const queryClient = useQueryClient();
  return useMemo(() => new CacheManager(queryClient), [queryClient]);
};
```

---

## Offline Support

### Network Status Detection

```typescript
// hooks/useNetworkStatus.ts
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Refetch queries when coming back online
        queryClient.refetchQueries();
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
};

// Offline indicator component
const OfflineIndicator: React.FC = () => {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-md shadow-lg">
      <div className="flex items-center gap-2">
        <WifiOff size={16} />
        <span>You're offline</span>
      </div>
    </div>
  );
};
```

---

## API Testing Strategies

### Mock API Service

```typescript
// lib/api/__mocks__/admin-api.ts
export const mockAdminApi = {
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUserRole: jest.fn(),
  deleteUser: jest.fn(),
  approveSupplier: jest.fn(),
  rejectSupplier: jest.fn(),
};

// Test utilities
export const createMockApiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
});

export const createMockApiError = (
  message: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>
): ApiError => ({
  success: false,
  message,
  statusCode,
  errors,
  timestamp: new Date().toISOString(),
});

// Test setup
beforeEach(() => {
  jest.clearAllMocks();
});
```

### Integration Tests

```typescript
// __tests__/api/admin-api.test.ts
describe("AdminApiService", () => {
  beforeEach(() => {
    // Reset axios mock
    mockedAxios.reset();
  });

  describe("getAllUsers", () => {
    it("should fetch users successfully", async () => {
      const mockUsers = [
        { id: 1, email: "user1@test.com", role: "USER" },
        { id: 2, email: "user2@test.com", role: "SUPPLIER" },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: createMockApiResponse({
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            hasNext: false,
            hasPrev: false,
          },
        }),
      });

      const result = await adminApi.getAllUsers({ page: 1, limit: 10 });

      expect(mockedAxios.get).toHaveBeenCalledWith("/admin/users", {
        params: { page: 1, limit: 10 },
      });
      expect(result.data.users).toEqual(mockUsers);
    });

    it("should handle API errors", async () => {
      const errorResponse = {
        response: {
          data: createMockApiError("Failed to fetch users", 500),
        },
      };

      mockedAxios.get.mockRejectedValueOnce(errorResponse);

      await expect(adminApi.getAllUsers()).rejects.toThrow(
        "Failed to fetch users"
      );
    });
  });
});
```

---

**Note**: This comprehensive API integration strategy ensures robust, type-safe, and maintainable communication between the frontend and backend services, with full error handling, caching, and offline support capabilities.
