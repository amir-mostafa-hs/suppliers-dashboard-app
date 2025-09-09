# Frontend - State Management

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [State Management Overview](#state-management-overview)
- [React Query (TanStack Query)](#react-query-tanstack-query)
- [Local State Management](#local-state-management)
- [Custom Hooks](#custom-hooks)
- [Form State Management](#form-state-management)
- [Authentication State](#authentication-state)
- [Error State Management](#error-state-management)
- [Loading States](#loading-states)
- [State Persistence](#state-persistence)
- [Performance Optimization](#performance-optimization)

---

## State Management Overview

The Suppliers Dashboard frontend uses a hybrid state management approach that combines React Query for server state, local React state for UI state, and custom hooks for shared logic. This approach provides optimal performance, developer experience, and maintainability.

### State Categories

- **Server State**: Data from API calls (React Query)
- **Client State**: UI state, form data, local preferences (React State)
- **Shared State**: Cross-component state (Custom Hooks + Context)
- **Derived State**: Computed values from existing state (useMemo)

### State Management Philosophy

- **Colocation**: Keep state as close to where it's used as possible
- **Minimal State**: Only store what can't be derived
- **Single Source of Truth**: Avoid state duplication
- **Predictable Updates**: Clear state update patterns

---

## React Query (TanStack Query)

React Query handles all server state management, providing caching, synchronization, and error handling for API interactions.

### Query Client Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3, // Retry failed requests 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when connection restored
    },
    mutations: {
      retry: 1, // Retry mutations once
      onError: (error) => {
        console.error("Mutation error:", error);
      },
    },
  },
});

// App setup
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>{/* Your routes */}</Routes>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Patterns

#### Basic Data Fetching

```typescript
// hooks/useUsers.ts
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => adminApi.getAllUsers(params),
    select: (data) => data.data,
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onError: (error) => {
      console.error("Failed to fetch users:", error);
    },
  });
};

// Usage in component
const AdminDashboard: React.FC = () => {
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });

  const {
    data: users,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useUsers(filters);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      <UserFilters filters={filters} onChange={setFilters} />
      <UserTable
        users={users?.users || []}
        pagination={users?.pagination}
        isRefreshing={isFetching}
      />
    </div>
  );
};
```

#### Dependent Queries

```typescript
// Sequential data fetching
const useSupplierWithDocuments = (supplierId: string) => {
  // First query - get supplier
  const { data: supplier, isLoading: supplierLoading } = useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: () => adminApi.getUserById(supplierId),
    select: (data) => data.data,
    enabled: !!supplierId,
  });

  // Second query - get documents (depends on first query)
  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ["supplier-documents", supplierId],
    queryFn: () => supplierApi.getDocuments(supplierId),
    select: (data) => data.data,
    enabled: !!supplier && supplier.role === "SUPPLIER",
  });

  return {
    supplier,
    documents,
    isLoading: supplierLoading || documentsLoading,
    hasData: !!supplier && !!documents,
  };
};
```

#### Infinite Queries for Pagination

```typescript
// Infinite scrolling with React Query
const useInfiniteUsers = (filters: UserFilters) => {
  return useInfiniteQuery({
    queryKey: ["users", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      adminApi.getAllUsers({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage.data;
      return pagination.hasNext ? pagination.page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.map((page) => page.data.users),
      pageParams: data.pageParams,
    }),
  });
};

// Usage with infinite scroll
const InfiniteUserList: React.FC = () => {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteUsers({ status: "active" });

  const allUsers = data?.pages.flat() || [];

  return (
    <div>
      {allUsers.map((user) => (
        <UserCard key={user.id} user={user} />
      ))}

      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </Button>
      )}
    </div>
  );
};
```

### Mutation Patterns

#### Basic Mutations

```typescript
// hooks/useSupplierMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierApi } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export const useCreateSupplierProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: supplierApi.createProfile,
    onSuccess: (data) => {
      // Update cache with new data
      queryClient.setQueryData(["supplier-profile"], data.data);

      // Invalidate related queries
      queryClient.invalidateQueries(["suppliers"]);

      toast({
        title: "Success",
        description: "Supplier profile created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create profile",
        variant: "destructive",
      });
    },
  });
};

// Usage in component
const SupplierApply: React.FC = () => {
  const createMutation = useCreateSupplierProfile();
  const navigate = useNavigate();

  const handleSubmit = (formData: SupplierProfileData) => {
    createMutation.mutate(formData, {
      onSuccess: () => {
        navigate("/supplier/profile");
      },
    });
  };

  return (
    <SupplierForm
      onSubmit={handleSubmit}
      isLoading={createMutation.isLoading}
    />
  );
};
```

#### Optimistic Updates

```typescript
// Optimistic updates for better UX
const useApproveSupplier = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      adminApi.approveSupplier(id, { notes }),

    onMutate: async ({ id }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(["users"]);
      await queryClient.cancelQueries(["user", id]);

      // Snapshot previous values
      const previousUsers = queryClient.getQueryData(["users"]);
      const previousUser = queryClient.getQueryData(["user", id]);

      // Optimistically update
      queryClient.setQueryData(["users"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.map((user: any) =>
            user.id === id
              ? {
                  ...user,
                  supplier: {
                    ...user.supplier,
                    status: "APPROVED",
                  },
                }
              : user
          ),
        };
      });

      queryClient.setQueryData(["user", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          supplier: {
            ...old.supplier,
            status: "APPROVED",
          },
        };
      });

      return { previousUsers, previousUser };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(["users"], context.previousUsers);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(["user", variables.id], context.previousUser);
      }

      toast({
        title: "Error",
        description: "Failed to approve supplier",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      toast({
        title: "Success",
        description: "Supplier approved successfully",
      });
    },

    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user"]);
    },
  });
};
```

### Cache Management

```typescript
// Manual cache updates
const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const updateUserInCache = (userId: string, updates: Partial<User>) => {
    // Update single user cache
    queryClient.setQueryData(["user", userId], (old: any) => ({
      ...old,
      ...updates,
    }));

    // Update user in users list cache
    queryClient.setQueryData(["users"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        users: old.users.map((user: User) =>
          user.id === userId ? { ...user, ...updates } : user
        ),
      };
    });
  };

  const removeUserFromCache = (userId: string) => {
    queryClient.removeQueries(["user", userId]);
    queryClient.setQueryData(["users"], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        users: old.users.filter((user: User) => user.id !== userId),
      };
    });
  };

  const prefetchUser = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["user", userId],
      queryFn: () => adminApi.getUserById(userId),
      staleTime: 1000 * 60 * 5,
    });
  };

  return {
    updateUserInCache,
    removeUserFromCache,
    prefetchUser,
  };
};
```

---

## Local State Management

### useState for Component State

```typescript
// Simple component state
const SupplierFilters: React.FC = () => {
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: null as DateRange | null,
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      status: "all",
      search: "",
      dateRange: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          Advanced {isAdvancedOpen ? "▲" : "▼"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value)}
            >
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Search</Label>
            <Input
              placeholder="Search suppliers..."
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
            />
          </div>

          {isAdvancedOpen && (
            <div className="space-y-4">
              <div>
                <Label>Date Range</Label>
                <DateRangePicker
                  value={filters.dateRange}
                  onChange={(range) => updateFilter("dateRange", range)}
                />
              </div>

              <div className="flex gap-2">
                <div className="flex-1">
                  <Label>Sort By</Label>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) => updateFilter("sortBy", value)}
                  >
                    <SelectContent>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="businessName">
                        Business Name
                      </SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1">
                  <Label>Order</Label>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => updateFilter("sortOrder", value)}
                  >
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={resetFilters} variant="outline" size="sm">
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

### useReducer for Complex State

```typescript
// Complex state with useReducer
interface DocumentUploadState {
  files: File[];
  uploading: boolean;
  progress: number;
  error: string | null;
  completed: string[];
  failed: string[];
}

type DocumentUploadAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "REMOVE_FILE"; index: number }
  | { type: "START_UPLOAD" }
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "FILE_COMPLETED"; fileName: string }
  | { type: "FILE_FAILED"; fileName: string; error: string }
  | { type: "UPLOAD_COMPLETE" }
  | { type: "RESET" };

const documentUploadReducer = (
  state: DocumentUploadState,
  action: DocumentUploadAction
): DocumentUploadState => {
  switch (action.type) {
    case "ADD_FILES":
      return {
        ...state,
        files: [...state.files, ...action.files],
        error: null,
      };

    case "REMOVE_FILE":
      return {
        ...state,
        files: state.files.filter((_, index) => index !== action.index),
      };

    case "START_UPLOAD":
      return {
        ...state,
        uploading: true,
        progress: 0,
        error: null,
        completed: [],
        failed: [],
      };

    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: action.progress,
      };

    case "FILE_COMPLETED":
      return {
        ...state,
        completed: [...state.completed, action.fileName],
      };

    case "FILE_FAILED":
      return {
        ...state,
        failed: [...state.failed, action.fileName],
        error: action.error,
      };

    case "UPLOAD_COMPLETE":
      return {
        ...state,
        uploading: false,
        progress: 100,
        files: [], // Clear files after successful upload
      };

    case "RESET":
      return {
        files: [],
        uploading: false,
        progress: 0,
        error: null,
        completed: [],
        failed: [],
      };

    default:
      return state;
  }
};

// Component using the reducer
const DocumentUpload: React.FC = () => {
  const [state, dispatch] = useReducer(documentUploadReducer, {
    files: [],
    uploading: false,
    progress: 0,
    error: null,
    completed: [],
    failed: [],
  });

  const uploadMutation = useMutation({
    mutationFn: supplierApi.uploadDocuments,
    onSuccess: () => {
      dispatch({ type: "UPLOAD_COMPLETE" });
    },
    onError: (error: any) => {
      dispatch({
        type: "FILE_FAILED",
        fileName: "upload",
        error: error.message,
      });
    },
  });

  const handleFileSelect = (files: FileList) => {
    const fileArray = Array.from(files);
    dispatch({ type: "ADD_FILES", files: fileArray });
  };

  const handleUpload = async () => {
    if (state.files.length === 0) return;

    dispatch({ type: "START_UPLOAD" });

    const formData = new FormData();
    state.files.forEach((file) => {
      formData.append("documents", file);
    });

    uploadMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Select Files</Label>
            <Input
              type="file"
              multiple
              accept=".pdf"
              onChange={(e) =>
                e.target.files && handleFileSelect(e.target.files)
              }
            />
          </div>

          {state.files.length > 0 && (
            <div>
              <Label>Selected Files</Label>
              <div className="space-y-2">
                {state.files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <span className="text-sm">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch({ type: "REMOVE_FILE", index })}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state.uploading && (
            <div>
              <Label>Upload Progress</Label>
              <Progress value={state.progress} className="w-full" />
            </div>
          )}

          {state.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={state.files.length === 0 || state.uploading}
            >
              {state.uploading ? "Uploading..." : "Upload Files"}
            </Button>

            <Button
              variant="outline"
              onClick={() => dispatch({ type: "RESET" })}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## Custom Hooks

### Authentication Hook

```typescript
// hooks/use-user.ts
import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { authApi } from "@/lib/api";

interface User {
  id: number;
  email: string;
  role: "USER" | "SUPPLIER" | "ADMIN";
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    const userData = response.data.user;
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetch: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
```

### Mobile Detection Hook

```typescript
// hooks/use-mobile.tsx
import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check initial value
    checkIsMobile();

    // Add event listener
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return isMobile;
};

// Usage in components
const Navigation: React.FC = () => {
  const isMobile = useMobile();

  return (
    <nav className={`navigation ${isMobile ? "mobile" : "desktop"}`}>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </nav>
  );
};
```

### Local Storage Hook

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Usage
const UserPreferences: React.FC = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'en');

  return (
    <div>
      <Select value={theme} onValueChange={setTheme}>
        <SelectContent>
          <SelectItem value="light">Light</SelectItem>
          <SelectItem value="dark">Dark</SelectItem>
        </SelectContent>
      </Select>

      <Select value={language} onValueChange={setLanguage}>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="es">Spanish</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
```

---

## Form State Management

### React Hook Form Integration

```typescript
// Complex form with validation
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const supplierSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  contactPerson: z.string().min(2, "Contact person is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  businessDescription: z
    .string()
    .min(50, "Description must be at least 50 characters"),
  businessType: z.enum([
    "corporation",
    "llc",
    "partnership",
    "sole_proprietorship",
  ]),
  yearEstablished: z.number().min(1800).max(new Date().getFullYear()),
  employeeCount: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]),
  annualRevenue: z.enum(["<100k", "100k-1m", "1m-10m", "10m-100m", "100m+"]),
  references: z
    .array(
      z.object({
        companyName: z.string().min(1, "Company name is required"),
        contactName: z.string().min(1, "Contact name is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().min(10, "Phone number required"),
        relationship: z.string().min(1, "Relationship description required"),
      })
    )
    .min(2, "At least 2 references are required")
    .max(5, "Maximum 5 references allowed"),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

const SupplierApplicationForm: React.FC = () => {
  const createMutation = useCreateSupplierProfile();

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      businessName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      businessDescription: "",
      businessType: "llc",
      yearEstablished: new Date().getFullYear(),
      employeeCount: "1-10",
      annualRevenue: "<100k",
      references: [
        {
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          relationship: "",
        },
        {
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          relationship: "",
        },
      ],
    },
    mode: "onChange", // Validate on change for better UX
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "references",
  });

  const onSubmit = (data: SupplierFormData) => {
    createMutation.mutate(data);
  };

  const addReference = () => {
    if (fields.length < 5) {
      append({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        relationship: "",
      });
    }
  };

  const removeReference = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supplier Application</CardTitle>
        <CardDescription>
          Please provide complete information about your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter business name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Person</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter contact person name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Address Information</h3>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter ZIP code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Information</h3>

              <FormField
                control={form.control}
                name="businessDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your business, products, and services"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="corporation">
                            Corporation
                          </SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="partnership">
                            Partnership
                          </SelectItem>
                          <SelectItem value="sole_proprietorship">
                            Sole Proprietorship
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee Count</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee count" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10</SelectItem>
                          <SelectItem value="11-50">11-50</SelectItem>
                          <SelectItem value="51-200">51-200</SelectItem>
                          <SelectItem value="201-1000">201-1000</SelectItem>
                          <SelectItem value="1000+">1000+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="annualRevenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select revenue range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="<100k">Less than $100K</SelectItem>
                          <SelectItem value="100k-1m">$100K - $1M</SelectItem>
                          <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                          <SelectItem value="10m-100m">$10M - $100M</SelectItem>
                          <SelectItem value="100m+">Over $100M</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* References */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Business References</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReference}
                  disabled={fields.length >= 5}
                >
                  Add Reference
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card key={field.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium">Reference {index + 1}</h4>
                    {fields.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReference(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`references.${index}.companyName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter company name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.contactName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter contact name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.email`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter email"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.phone`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`references.${index}.relationship`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Relationship Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your business relationship"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Save Draft
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isLoading || !form.formState.isValid}
              >
                {createMutation.isLoading
                  ? "Submitting..."
                  : "Submit Application"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
```

---

## Authentication State

The authentication state is managed globally using a custom React Context and hook pattern.

```typescript
// Complete authentication state management
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Check if user is locked out due to too many failed attempts
  const checkLockout = useCallback(() => {
    const lockoutTime = localStorage.getItem("lockout_time");
    if (lockoutTime) {
      const lockoutExpiry = new Date(lockoutTime);
      if (new Date() < lockoutExpiry) {
        setIsLocked(true);
        return true;
      } else {
        localStorage.removeItem("lockout_time");
        setLoginAttempts(0);
        setIsLocked(false);
      }
    }
    return false;
  }, []);

  const checkAuthStatus = useCallback(async () => {
    if (checkLockout()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      const userData = response.data;
      setUser(userData);
      setIsAuthenticated(true);
      setLoginAttempts(0); // Reset on successful auth
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [checkLockout]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      if (isLocked) {
        throw new Error(
          "Account is temporarily locked. Please try again later."
        );
      }

      try {
        const response = await authApi.login(credentials);
        const userData = response.data.user;
        setUser(userData);
        setIsAuthenticated(true);
        setLoginAttempts(0);
        localStorage.removeItem("lockout_time");
      } catch (error) {
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= 5) {
          // Lock for 15 minutes after 5 failed attempts
          const lockoutTime = new Date(Date.now() + 15 * 60 * 1000);
          localStorage.setItem("lockout_time", lockoutTime.toISOString());
          setIsLocked(true);
          throw new Error(
            "Too many failed attempts. Account locked for 15 minutes."
          );
        }

        throw error;
      }
    },
    [loginAttempts, isLocked]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoginAttempts(0);
      setIsLocked(false);
      localStorage.removeItem("lockout_time");
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    isLocked,
    loginAttempts,
    remainingAttempts: Math.max(0, 5 - loginAttempts),
    login,
    logout,
    refetch: checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

---

## Error State Management

```typescript
// Error boundary for React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("React Error Boundary caught an error:", error, errorInfo);

    // Log to error reporting service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-destructive">
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                An unexpected error occurred. Please refresh the page or try
                again later.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()}>
                  Refresh Page
                </Button>
                <Button
                  variant="outline"
                  onClick={() => this.setState({ hasError: false })}
                >
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handling hook
const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback(
    (error: any, context?: string) => {
      console.error(`Error ${context ? `in ${context}` : ""}:`, error);

      let message = "An unexpected error occurred";

      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }

      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
    [toast]
  );

  return { handleError };
};
```

---

## Loading States

```typescript
// Centralized loading state management
const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  }, []);

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key] || false;
    },
    [loadingStates]
  );

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
  };
};

// Usage in components
const AdminDashboard: React.FC = () => {
  const { setLoading, isLoading } = useLoadingState();

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: adminApi.getAllUsers,
    onSettled: () => setLoading("users", false),
  });

  const suppliersQuery = useQuery({
    queryKey: ["suppliers"],
    queryFn: supplierApi.getAll,
    onSettled: () => setLoading("suppliers", false),
  });

  useEffect(() => {
    if (usersQuery.isFetching) setLoading("users", true);
    if (suppliersQuery.isFetching) setLoading("suppliers", true);
  }, [usersQuery.isFetching, suppliersQuery.isFetching, setLoading]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading("users") ? (
            <Loading text="Loading users..." />
          ) : (
            <UsersList users={usersQuery.data} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading("suppliers") ? (
            <Loading text="Loading suppliers..." />
          ) : (
            <SuppliersList suppliers={suppliersQuery.data} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## State Persistence

```typescript
// Persist form data to prevent loss
const useFormPersistence = <T>(
  key: string,
  initialValues: T,
  shouldPersist: boolean = true
) => {
  const [values, setValues] = useState<T>(() => {
    if (!shouldPersist) return initialValues;

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValues;
    } catch {
      return initialValues;
    }
  });

  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => {
      const updated = { ...prev, ...newValues };

      if (shouldPersist) {
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to persist form data:', error);
        }
      }

      return updated;
    });
  }, [key, shouldPersist]);

  const clearPersistedData = useCallback(() => {
    if (shouldPersist) {
      localStorage.removeItem(key);
    }
    setValues(initialValues);
  }, [key, initialValues, shouldPersist]);

  return {
    values,
    updateValues,
    clearPersistedData,
  };
};

// Usage in forms
const SupplierApplicationForm: React.FC = () => {
  const { values, updateValues, clearPersistedData } = useFormPersistence(
    'supplier-application-draft',
    {
      businessName: '',
      email: '',
      phone: '',
      // ... other initial values
    }
  );

  const form = useForm({
    defaultValues: values,
  });

  // Auto-save form data
  useEffect(() => {
    const subscription = form.watch((formData) => {
      updateValues(formData);
    });

    return () => subscription.unsubscribe();
  }, [form, updateValues]);

  const onSubmit = async (data: any) => {
    try {
      await createSupplierProfile(data);
      clearPersistedData(); // Clear draft after successful submission
    } catch (error) {
      // Form data remains persisted for retry
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
};
```

---

## Performance Optimization

```typescript
// Debounced search state
const useDebouncedSearch = (initialValue: string = "", delay: number = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return {
    value,
    debouncedValue,
    setValue,
  };
};

// Optimized search component
const UserSearch: React.FC = () => {
  const { value, debouncedValue, setValue } = useDebouncedSearch();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users", "search", debouncedValue],
    queryFn: () => adminApi.searchUsers({ search: debouncedValue }),
    enabled: debouncedValue.length >= 2,
  });

  return (
    <div>
      <Input
        placeholder="Search users..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {isLoading && <Loading size="sm" />}

      {users && (
        <div className="mt-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
    </div>
  );
};
```

---

**Note**: This comprehensive state management strategy ensures optimal performance, maintainability, and user experience across the entire frontend application.
