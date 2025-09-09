# Frontend - Component Architecture

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [Component Architecture Overview](#component-architecture-overview)
- [Component Hierarchy](#component-hierarchy)
- [Design Patterns](#design-patterns)
- [Shadcn/ui Components](#shadcnui-components)
- [Custom Components](#custom-components)
- [Page Components](#page-components)
- [State Management in Components](#state-management-in-components)
- [Component Communication](#component-communication)
- [Performance Optimization](#performance-optimization)
- [Testing Strategy](#testing-strategy)

---

## Component Architecture Overview

The Suppliers Dashboard frontend uses a well-structured component architecture built on React 18 with TypeScript, leveraging the Shadcn/ui design system for consistent, accessible, and reusable UI components.

### Architecture Principles

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Build complex UIs from simple components
- **Reusability**: Components designed for multiple use cases
- **Accessibility**: WCAG compliant components by default
- **Type Safety**: Full TypeScript coverage for all components

### Component Categories

1. **UI Components**: Basic, reusable interface elements (Shadcn/ui)
2. **Layout Components**: Page structure and navigation
3. **Feature Components**: Business logic components
4. **Page Components**: Route-level components
5. **Custom Hooks**: Reusable logic components

---

## Component Hierarchy

### Application Structure

```
App.tsx (Root)
├── Navigation.tsx (Global)
├── Router (React Router)
│   ├── Public Routes
│   │   ├── Index.tsx (Landing Page)
│   │   ├── Login.tsx (Authentication)
│   │   └── Register.tsx (User Registration)
│   │
│   └── Protected Routes
│       ├── Dashboard.tsx (Role-based Dashboard)
│       │
│       ├── Supplier Routes
│       │   ├── SupplierApply.tsx (Application Form)
│       │   └── SupplierProfile.tsx (Profile Management)
│       │
│       └── Admin Routes
│           ├── AdminDashboard.tsx (Admin Overview)
│           └── SupplierDetail.tsx (Application Review)
│
├── Global Components
│   ├── Loading.tsx (Loading States)
│   ├── Toast System (Notifications)
│   └── Error Boundaries (Error Handling)
│
└── UI Components (Shadcn/ui)
    ├── Primitives (40+ components)
    └── Composed Components
```

### File Organization Strategy

```typescript
src/
├── components/
│   ├── ui/                    # Shadcn/ui components (40+)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── Loading.tsx            # Global loading component
│   └── Navigation.tsx         # Main navigation component
│
├── pages/                     # Route components
│   ├── Dashboard.tsx          # Main dashboard
│   ├── Index.tsx              # Landing page
│   ├── NotFound.tsx           # 404 page
│   │
│   ├── admin/                 # Admin pages
│   │   ├── AdminDashboard.tsx
│   │   └── SupplierDetail.tsx
│   │
│   ├── auth/                  # Authentication pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   │
│   └── supplier/              # Supplier pages
│       ├── SupplierApply.tsx
│       └── SupplierProfile.tsx
│
└── hooks/                     # Custom React hooks
    ├── use-mobile.tsx
    ├── use-toast.ts
    └── use-user.ts
```

---

## Design Patterns

### 1. Container/Presentation Pattern

Separates business logic from UI rendering for better testability and reusability.

```typescript
// Container Component (Logic)
const SupplierProfileContainer: React.FC = () => {
  const {
    data: supplier,
    isLoading,
    error,
  } = useQuery("supplier-profile", supplierApi.getProfile);

  const updateMutation = useMutation(supplierApi.updateProfile, {
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile");
    },
  });

  const handleUpdate = (profileData: SupplierProfileData) => {
    updateMutation.mutate(profileData);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <SupplierProfilePresentation
      supplier={supplier}
      onUpdate={handleUpdate}
      isUpdating={updateMutation.isLoading}
    />
  );
};

// Presentation Component (UI)
interface SupplierProfilePresentationProps {
  supplier: SupplierData;
  onUpdate: (data: SupplierProfileData) => void;
  isUpdating: boolean;
}

const SupplierProfilePresentation: React.FC<
  SupplierProfilePresentationProps
> = ({ supplier, onUpdate, isUpdating }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Supplier Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <SupplierForm
          initialData={supplier}
          onSubmit={onUpdate}
          isLoading={isUpdating}
        />
      </CardContent>
    </Card>
  );
};
```

### 2. Custom Hook Pattern

Encapsulates reusable logic for component state and side effects.

```typescript
// Custom hook for user authentication
const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    setUser(response.data.user);
    setIsAuthenticated(true);
    return response.data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refetch: checkAuthStatus,
  };
};

// Usage in components
const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <DashboardContent user={user} />;
};
```

### 3. Higher-Order Component (HOC) Pattern

For cross-cutting concerns like authentication and error boundaries.

```typescript
// Authentication HOC
const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles: string[] = []
) => {
  return (props: P) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <Loading />;

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }

    return <Component {...props} />;
  };
};

// Usage
const AdminDashboard = withAuth(AdminDashboardComponent, ["ADMIN"]);
const SupplierProfile = withAuth(SupplierProfileComponent, ["SUPPLIER"]);
```

### 4. Compound Component Pattern

For complex components with multiple related parts.

```typescript
// Compound component for data tables
const DataTable = {
  Root: ({ children, ...props }: DataTableProps) => (
    <div className="data-table" {...props}>
      {children}
    </div>
  ),

  Header: ({ children }: { children: React.ReactNode }) => (
    <div className="data-table-header">{children}</div>
  ),

  Body: ({ children }: { children: React.ReactNode }) => (
    <div className="data-table-body">{children}</div>
  ),

  Row: ({ children, ...props }: DataTableRowProps) => (
    <div className="data-table-row" {...props}>
      {children}
    </div>
  ),

  Cell: ({ children }: { children: React.ReactNode }) => (
    <div className="data-table-cell">{children}</div>
  ),
};

// Usage
<DataTable.Root>
  <DataTable.Header>
    <DataTable.Row>
      <DataTable.Cell>Name</DataTable.Cell>
      <DataTable.Cell>Email</DataTable.Cell>
      <DataTable.Cell>Status</DataTable.Cell>
    </DataTable.Row>
  </DataTable.Header>
  <DataTable.Body>
    {users.map((user) => (
      <DataTable.Row key={user.id}>
        <DataTable.Cell>{user.name}</DataTable.Cell>
        <DataTable.Cell>{user.email}</DataTable.Cell>
        <DataTable.Cell>{user.status}</DataTable.Cell>
      </DataTable.Row>
    ))}
  </DataTable.Body>
</DataTable.Root>;
```

---

## Shadcn/ui Components

### Core UI Components Library

The application uses Shadcn/ui, a collection of reusable components built on Radix UI primitives with Tailwind CSS styling.

#### Form Components

```typescript
// Button variations
import { Button } from "@/components/ui/button"

<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>

// Input components
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

<Input type="email" placeholder="Enter your email" />
<Textarea placeholder="Enter description" />
<Select>
  <SelectValue placeholder="Select a role" />
  <SelectContent>
    <SelectItem value="user">User</SelectItem>
    <SelectItem value="supplier">Supplier</SelectItem>
  </SelectContent>
</Select>
```

#### Layout Components

```typescript
// Card components
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Supplier Information</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Business details and information</p>
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>;

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
    </DialogHeader>
    <p>Are you sure you want to proceed?</p>
  </DialogContent>
</Dialog>;
```

#### Data Display Components

```typescript
// Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {suppliers.map((supplier) => (
      <TableRow key={supplier.id}>
        <TableCell>{supplier.businessName}</TableCell>
        <TableCell>{supplier.email}</TableCell>
        <TableCell>{supplier.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Badge components
import { Badge } from "@/components/ui/badge"

<Badge variant="default">Pending</Badge>
<Badge variant="success">Approved</Badge>
<Badge variant="destructive">Rejected</Badge>
```

#### Feedback Components

```typescript
// Alert components
import { Alert, AlertDescription } from "@/components/ui/alert";

<Alert>
  <AlertDescription>
    Your application has been submitted successfully.
  </AlertDescription>
</Alert>;

// Toast system
import { useToast } from "@/components/ui/use-toast";

const { toast } = useToast();

toast({
  title: "Success",
  description: "Profile updated successfully",
});

toast({
  title: "Error",
  description: "Failed to update profile",
  variant: "destructive",
});
```

### Complete Component List

```typescript
// All available Shadcn/ui components
const availableComponents = {
  // Form & Input
  'Button', 'Input', 'Textarea', 'Select', 'Checkbox', 'RadioGroup',
  'Switch', 'Slider', 'Form', 'Label',

  // Layout
  'Card', 'Sheet', 'Dialog', 'Drawer', 'Tabs', 'Accordion',
  'Collapsible', 'Separator', 'AspectRatio', 'Resizable',

  // Navigation
  'NavigationMenu', 'Breadcrumb', 'Pagination', 'MenuBar',
  'ContextMenu', 'DropdownMenu',

  // Data Display
  'Table', 'Badge', 'Avatar', 'Progress', 'Skeleton',
  'Calendar', 'Chart', 'Carousel',

  // Feedback
  'Alert', 'Toast', 'Toaster', 'HoverCard', 'Popover', 'Tooltip',

  // Utility
  'ScrollArea', 'Command', 'InputOTP', 'ToggleGroup', 'Toggle'
};
```

---

## Custom Components

### Loading Component

```typescript
// components/Loading.tsx
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
    </div>
  );
};
```

### Navigation Component

```typescript
// components/Navigation.tsx
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-user";

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActivePath = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="border-b bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              Suppliers Dashboard
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActivePath("/dashboard")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Dashboard
                </Link>

                {user?.role === "SUPPLIER" && (
                  <>
                    <Link
                      to="/supplier/apply"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActivePath("/supplier/apply")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Apply
                    </Link>
                    <Link
                      to="/supplier/profile"
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActivePath("/supplier/profile")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Profile
                    </Link>
                  </>
                )}

                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin/dashboard"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActivePath("/admin/dashboard")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {user?.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
```

---

## Page Components

### Dashboard Component

```typescript
// pages/Dashboard.tsx
import { useAuth } from "@/hooks/use-user";
import { AdminDashboard } from "./admin/AdminDashboard";
import { SupplierDashboard } from "./supplier/SupplierDashboard";
import { UserDashboard } from "./UserDashboard";

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case "ADMIN":
        return <AdminDashboard />;
      case "SUPPLIER":
        return <SupplierDashboard />;
      case "USER":
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Welcome back, {user?.email}</h1>
        <p className="text-muted-foreground">Role: {user?.role}</p>
      </div>

      {renderDashboard()}
    </div>
  );
};
```

### Login Component

```typescript
// pages/auth/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-user";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-primary hover:underline"
              >
                Register here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## State Management in Components

### Local State with useState

```typescript
const SupplierApply: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    businessDescription: "",
  });

  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Component logic...
};
```

### Complex State with useReducer

```typescript
interface DocumentState {
  files: File[];
  uploading: boolean;
  uploadProgress: number;
  error: string | null;
}

type DocumentAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "REMOVE_FILE"; index: number }
  | { type: "START_UPLOAD" }
  | { type: "UPDATE_PROGRESS"; progress: number }
  | { type: "UPLOAD_SUCCESS" }
  | { type: "UPLOAD_ERROR"; error: string }
  | { type: "RESET" };

const documentReducer = (
  state: DocumentState,
  action: DocumentAction
): DocumentState => {
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
      return { ...state, uploading: true, uploadProgress: 0, error: null };
    case "UPDATE_PROGRESS":
      return { ...state, uploadProgress: action.progress };
    case "UPLOAD_SUCCESS":
      return { ...state, uploading: false, uploadProgress: 100, files: [] };
    case "UPLOAD_ERROR":
      return {
        ...state,
        uploading: false,
        error: action.error,
        uploadProgress: 0,
      };
    case "RESET":
      return { files: [], uploading: false, uploadProgress: 0, error: null };
    default:
      return state;
  }
};

const DocumentUpload: React.FC = () => {
  const [state, dispatch] = useReducer(documentReducer, {
    files: [],
    uploading: false,
    uploadProgress: 0,
    error: null,
  });

  // Component logic using dispatch...
};
```

### Global State with React Query

```typescript
// Custom hook for supplier data
const useSupplierProfile = () => {
  return useQuery({
    queryKey: ["supplier-profile"],
    queryFn: async () => {
      const response = await supplierApi.getProfile();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    onError: (error) => {
      toast.error("Failed to load supplier profile");
    },
  });
};

// Mutation hook for updates
const useUpdateSupplierProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: supplierApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["supplier-profile"]);
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });
};

// Usage in component
const SupplierProfile: React.FC = () => {
  const { data: supplier, isLoading, error } = useSupplierProfile();
  const updateMutation = useUpdateSupplierProfile();

  const handleUpdate = (profileData: any) => {
    updateMutation.mutate(profileData);
  };

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage error={error} />;

  return <SupplierProfileForm supplier={supplier} onUpdate={handleUpdate} />;
};
```

---

## Component Communication

### Parent-Child Communication

```typescript
// Parent Component
const AdminDashboard: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSupplier(null);
  };

  return (
    <div>
      <SupplierList onSupplierSelect={handleSupplierSelect} />

      <SupplierModal
        supplier={selectedSupplier}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// Child Component
interface SupplierListProps {
  onSupplierSelect: (supplier: Supplier) => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ onSupplierSelect }) => {
  const { data: suppliers } = useQuery("suppliers", supplierApi.getAll);

  return (
    <div className="grid gap-4">
      {suppliers?.map((supplier) => (
        <Card
          key={supplier.id}
          className="cursor-pointer"
          onClick={() => onSupplierSelect(supplier)}
        >
          <CardContent>
            <h3>{supplier.businessName}</h3>
            <p>{supplier.status}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

### Sibling Communication via Custom Hook

```typescript
// Custom hook for managing shared state
const useSupplierSelection = () => {
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  return {
    selectedSupplier,
    setSelectedSupplier,
    filters,
    setFilters,
  };
};

// Parent component providing the hook
const AdminDashboardProvider: React.FC = () => {
  const supplierSelection = useSupplierSelection();

  return (
    <SupplierSelectionContext.Provider value={supplierSelection}>
      <div className="grid grid-cols-2 gap-6">
        <SupplierFilters />
        <SupplierDetails />
      </div>
    </SupplierSelectionContext.Provider>
  );
};

// Child components using the shared state
const SupplierFilters: React.FC = () => {
  const { filters, setFilters, setSelectedSupplier } = useContext(
    SupplierSelectionContext
  );

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setSelectedSupplier(null); // Clear selection when filters change
  };

  return <FilterComponent filters={filters} onChange={handleFilterChange} />;
};
```

---

## Performance Optimization

### React.memo for Preventing Unnecessary Re-renders

```typescript
// Memoized component that only re-renders when props change
const SupplierCard = React.memo<SupplierCardProps>(
  ({ supplier, onSelect, isSelected }) => {
    return (
      <Card
        className={`cursor-pointer transition-colors ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
        onClick={() => onSelect(supplier)}
      >
        <CardContent>
          <h3 className="font-semibold">{supplier.businessName}</h3>
          <p className="text-sm text-muted-foreground">{supplier.email}</p>
          <Badge variant={getStatusVariant(supplier.status)}>
            {supplier.status}
          </Badge>
        </CardContent>
      </Card>
    );
  }
);

SupplierCard.displayName = "SupplierCard";
```

### useMemo and useCallback for Expensive Operations

```typescript
const SupplierAnalytics: React.FC = () => {
  const { data: suppliers } = useQuery("suppliers", supplierApi.getAll);

  // Memoize expensive calculations
  const analytics = useMemo(() => {
    if (!suppliers) return null;

    return {
      totalSuppliers: suppliers.length,
      pendingCount: suppliers.filter((s) => s.status === "PENDING").length,
      approvedCount: suppliers.filter((s) => s.status === "APPROVED").length,
      rejectedCount: suppliers.filter((s) => s.status === "REJECTED").length,
      recentApplications: suppliers
        .filter((s) => isWithinLastWeek(s.createdAt))
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    };
  }, [suppliers]);

  // Memoize callback functions
  const handleStatusFilter = useCallback((status: string) => {
    setFilterStatus(status);
  }, []);

  const handleSupplierAction = useCallback(
    (supplierId: string, action: string) => {
      // Handle supplier actions
    },
    []
  );

  if (!analytics) return <Loading />;

  return (
    <div className="space-y-6">
      <StatsCards analytics={analytics} />
      <SupplierTable
        suppliers={suppliers}
        onStatusFilter={handleStatusFilter}
        onSupplierAction={handleSupplierAction}
      />
    </div>
  );
};
```

### Lazy Loading for Code Splitting

```typescript
// Lazy load page components
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SupplierDetail = lazy(() => import("./pages/admin/SupplierDetail"));
const SupplierApply = lazy(() => import("./pages/supplier/SupplierApply"));

// Wrap lazy components with Suspense
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/supplier/apply" element={<SupplierApply />} />
          {/* Other routes */}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
```

---

## Testing Strategy

### Component Testing with React Testing Library

```typescript
// SupplierCard.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { SupplierCard } from "./SupplierCard";

const mockSupplier = {
  id: "1",
  businessName: "Test Business",
  email: "test@business.com",
  status: "PENDING",
};

describe("SupplierCard", () => {
  it("renders supplier information correctly", () => {
    render(
      <SupplierCard
        supplier={mockSupplier}
        onSelect={jest.fn()}
        isSelected={false}
      />
    );

    expect(screen.getByText("Test Business")).toBeInTheDocument();
    expect(screen.getByText("test@business.com")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
  });

  it("calls onSelect when clicked", () => {
    const mockOnSelect = jest.fn();

    render(
      <SupplierCard
        supplier={mockSupplier}
        onSelect={mockOnSelect}
        isSelected={false}
      />
    );

    fireEvent.click(screen.getByRole("article"));
    expect(mockOnSelect).toHaveBeenCalledWith(mockSupplier);
  });

  it("applies selected styling when isSelected is true", () => {
    render(
      <SupplierCard
        supplier={mockSupplier}
        onSelect={jest.fn()}
        isSelected={true}
      />
    );

    const card = screen.getByRole("article");
    expect(card).toHaveClass("ring-2", "ring-primary");
  });
});
```

### Custom Hook Testing

```typescript
// useAuth.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useAuth } from "./use-auth";

describe("useAuth", () => {
  it("initializes with unauthenticated state", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBe(null);
    expect(result.current.isLoading).toBe(true);
  });

  it("handles login successfully", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: 1,
      email: "test@example.com",
      role: "USER",
    });
  });
});
```

### Integration Testing

```typescript
// Login.integration.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Login } from "./Login";

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Login Integration", () => {
  it("performs complete login flow", async () => {
    renderWithProviders(<Login />);

    // Fill out form
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your password"), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Login"));

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText("Logged in successfully")).toBeInTheDocument();
    });
  });
});
```

---

**Note**: This component architecture provides a scalable, maintainable foundation for the React frontend with clear separation of concerns, reusable components, and comprehensive testing strategies.
