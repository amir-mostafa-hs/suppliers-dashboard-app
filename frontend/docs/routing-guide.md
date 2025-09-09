# Frontend - Routing Guide

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [Routing Overview](#routing-overview)
- [React Router Configuration](#react-router-configuration)
- [Route Structure](#route-structure)
- [Protected Routes](#protected-routes)
- [Role-Based Access Control](#role-based-access-control)
- [Navigation Components](#navigation-components)
- [Route Guards](#route-guards)
- [Dynamic Routing](#dynamic-routing)
- [Query Parameters](#query-parameters)
- [Nested Routes](#nested-routes)
- [Route Transitions](#route-transitions)
- [Error Boundaries](#error-boundaries)
- [SEO and Meta Tags](#seo-and-meta-tags)

---

## Routing Overview

The Suppliers Dashboard frontend uses React Router v6 for client-side routing, providing a comprehensive navigation system with role-based access control, protected routes, and seamless user experience. The routing architecture supports multi-role authentication, dynamic route generation, and advanced navigation patterns.

### Routing Philosophy

- **Role-Based Navigation**: Different routes for USER, SUPPLIER, and ADMIN roles
- **Protected Routes**: Authentication and authorization checks
- **Nested Routing**: Hierarchical route structures for complex layouts
- **Dynamic Routes**: Parameter-based route matching
- **Lazy Loading**: Code splitting for optimal performance
- **SEO Optimization**: Meta tags and structured navigation

### Route Hierarchy

```
/ (Index)
├── /auth
│   ├── /login
│   ├── /register
│   ├── /forgot-password
│   └── /reset-password
├── /dashboard (Protected)
├── /admin (Admin Only)
│   ├── /users
│   ├── /suppliers
│   └── /settings
├── /supplier (Supplier Only)
│   ├── /profile
│   ├── /documents
│   └── /application
└── /404 (Not Found)
```

---

## React Router Configuration

### Main Router Setup

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-user";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteGuard } from "@/components/RouteGuard";
import { LoadingProvider } from "@/components/Loading";

// Lazy load components for code splitting
const Index = lazy(() => import("@/pages/Index"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));

// Admin routes
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminSuppliers = lazy(() => import("@/pages/admin/AdminSuppliers"));
const AdminSettings = lazy(() => import("@/pages/admin/AdminSettings"));

// Supplier routes
const SupplierDashboard = lazy(
  () => import("@/pages/supplier/SupplierDashboard")
);
const SupplierProfile = lazy(() => import("@/pages/supplier/SupplierProfile"));
const SupplierDocuments = lazy(
  () => import("@/pages/supplier/SupplierDocuments")
);
const SupplierApplication = lazy(
  () => import("@/pages/supplier/SupplierApplication")
);

const NotFound = lazy(() => import("@/pages/NotFound"));

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <LoadingProvider>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />

                {/* Authentication Routes */}
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route
                  path="/auth/forgot-password"
                  element={<ForgotPassword />}
                />
                <Route
                  path="/auth/reset-password"
                  element={<ResetPassword />}
                />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RouteGuard requireAuth>
                      <Dashboard />
                    </RouteGuard>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <RouteGuard requireAuth requiredRole="ADMIN">
                      <AdminRoutes />
                    </RouteGuard>
                  }
                />

                {/* Supplier Routes */}
                <Route
                  path="/supplier/*"
                  element={
                    <RouteGuard requireAuth requiredRole="SUPPLIER">
                      <SupplierRoutes />
                    </RouteGuard>
                  }
                />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </LoadingProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
```

### Nested Route Components

```typescript
// AdminRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/layouts/AdminLayout";

const AdminRoutes: React.FC = () => {
  return (
    <AdminLayout>
      <Routes>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:id" element={<UserDetails />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="suppliers/:id" element={<SupplierDetails />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AdminLayout>
  );
};

// SupplierRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { SupplierLayout } from "@/components/layouts/SupplierLayout";

const SupplierRoutes: React.FC = () => {
  return (
    <SupplierLayout>
      <Routes>
        <Route index element={<SupplierDashboard />} />
        <Route path="profile" element={<SupplierProfile />} />
        <Route path="documents" element={<SupplierDocuments />} />
        <Route path="application" element={<SupplierApplication />} />
        <Route path="*" element={<Navigate to="/supplier" replace />} />
      </Routes>
    </SupplierLayout>
  );
};
```

---

## Route Structure

### Route Definitions

```typescript
// config/routes.ts
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<React.ComponentType<any>>;
  roles?: ("USER" | "SUPPLIER" | "ADMIN")[];
  requireAuth?: boolean;
  title?: string;
  description?: string;
  showInNav?: boolean;
  icon?: React.ComponentType;
}

export const publicRoutes: RouteConfig[] = [
  {
    path: "/",
    element: Index,
    title: "Suppliers Dashboard",
    description: "Welcome to the Suppliers Dashboard platform",
    showInNav: false,
  },
  {
    path: "/auth/login",
    element: Login,
    title: "Login",
    description: "Sign in to your account",
    showInNav: false,
  },
  {
    path: "/auth/register",
    element: Register,
    title: "Register",
    description: "Create a new account",
    showInNav: false,
  },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    element: Dashboard,
    requireAuth: true,
    title: "Dashboard",
    description: "Your personal dashboard",
    showInNav: true,
    icon: LayoutDashboard,
  },
];

export const adminRoutes: RouteConfig[] = [
  {
    path: "/admin",
    element: AdminDashboard,
    roles: ["ADMIN"],
    requireAuth: true,
    title: "Admin Dashboard",
    description: "Administrative overview",
    showInNav: true,
    icon: Shield,
  },
  {
    path: "/admin/users",
    element: AdminUsers,
    roles: ["ADMIN"],
    requireAuth: true,
    title: "User Management",
    description: "Manage platform users",
    showInNav: true,
    icon: Users,
  },
  {
    path: "/admin/suppliers",
    element: AdminSuppliers,
    roles: ["ADMIN"],
    requireAuth: true,
    title: "Supplier Management",
    description: "Review and manage suppliers",
    showInNav: true,
    icon: Building2,
  },
];

export const supplierRoutes: RouteConfig[] = [
  {
    path: "/supplier",
    element: SupplierDashboard,
    roles: ["SUPPLIER"],
    requireAuth: true,
    title: "Supplier Dashboard",
    description: "Your supplier dashboard",
    showInNav: true,
    icon: LayoutDashboard,
  },
  {
    path: "/supplier/profile",
    element: SupplierProfile,
    roles: ["SUPPLIER"],
    requireAuth: true,
    title: "Profile Management",
    description: "Manage your supplier profile",
    showInNav: true,
    icon: User,
  },
  {
    path: "/supplier/documents",
    element: SupplierDocuments,
    roles: ["SUPPLIER"],
    requireAuth: true,
    title: "Documents",
    description: "Upload and manage documents",
    showInNav: true,
    icon: FileText,
  },
];
```

---

## Protected Routes

### Route Guard Component

```typescript
// components/RouteGuard.tsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-user";
import { Loading } from "@/components/Loading";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "USER" | "SUPPLIER" | "ADMIN";
  requiredRoles?: ("USER" | "SUPPLIER" | "ADMIN")[];
  fallbackPath?: string;
  requireVerification?: boolean;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requiredRole,
  requiredRoles,
  fallbackPath = "/auth/login",
  requireVerification = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading fullScreen text="Checking authentication..." />;
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check email verification requirement
  if (requireVerification && user && !user.emailVerified) {
    return (
      <Navigate to="/auth/verify-email" state={{ from: location }} replace />
    );
  }

  // Check single role requirement
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check multiple roles requirement
  if (requiredRoles && !requiredRoles.includes(user?.role!)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check supplier-specific requirements
  if (requiredRole === "SUPPLIER" || requiredRoles?.includes("SUPPLIER")) {
    if (user?.supplier?.status === "REJECTED") {
      return <Navigate to="/supplier/application/rejected" replace />;
    }

    if (
      user?.supplier?.status === "PENDING" &&
      location.pathname !== "/supplier/application"
    ) {
      return <Navigate to="/supplier/application/pending" replace />;
    }
  }

  return <>{children}</>;
};
```

### Authentication Hook Integration

```typescript
// hooks/use-route-access.ts
import { useAuth } from "./use-user";
import { useLocation } from "react-router-dom";

export const useRouteAccess = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const hasRole = (role: "USER" | "SUPPLIER" | "ADMIN"): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: ("USER" | "SUPPLIER" | "ADMIN")[]): boolean => {
    return roles.includes(user?.role!);
  };

  const canAccessAdminRoutes = (): boolean => {
    return isAuthenticated && hasRole("ADMIN");
  };

  const canAccessSupplierRoutes = (): boolean => {
    return isAuthenticated && hasRole("SUPPLIER");
  };

  const canAccessRoute = (routeConfig: RouteConfig): boolean => {
    if (!routeConfig.requireAuth) return true;
    if (!isAuthenticated) return false;

    if (routeConfig.roles) {
      return hasAnyRole(routeConfig.roles);
    }

    return true;
  };

  const getRedirectPath = (): string => {
    if (!isAuthenticated) return "/auth/login";

    const { role } = user!;
    const defaultPaths = {
      USER: "/dashboard",
      SUPPLIER: "/supplier",
      ADMIN: "/admin",
    };

    return defaultPaths[role] || "/dashboard";
  };

  return {
    user,
    isAuthenticated,
    hasRole,
    hasAnyRole,
    canAccessAdminRoutes,
    canAccessSupplierRoutes,
    canAccessRoute,
    getRedirectPath,
    currentPath: location.pathname,
  };
};
```

---

## Role-Based Access Control

### Navigation Menu Generator

```typescript
// components/Navigation.tsx
import { useRouteAccess } from "@/hooks/use-route-access";
import { adminRoutes, supplierRoutes, protectedRoutes } from "@/config/routes";

export const Navigation: React.FC = () => {
  const { user, canAccessRoute, currentPath } = useRouteAccess();
  const isMobile = useMobile();

  const getNavigationItems = () => {
    if (!user) return [];

    let routes: RouteConfig[] = [...protectedRoutes];

    if (user.role === "ADMIN") {
      routes = [...routes, ...adminRoutes];
    }

    if (user.role === "SUPPLIER") {
      routes = [...routes, ...supplierRoutes];
    }

    return routes
      .filter((route) => route.showInNav && canAccessRoute(route))
      .map((route) => ({
        ...route,
        isActive:
          currentPath === route.path ||
          currentPath.startsWith(route.path + "/"),
      }));
  };

  const navigationItems = getNavigationItems();

  if (isMobile) {
    return <MobileNavigation items={navigationItems} />;
  }

  return (
    <nav className="bg-card border-r border-border h-full">
      <div className="p-4">
        <div className="space-y-1">
          {navigationItems.map((item) => (
            <NavigationItem
              key={item.path}
              to={item.path}
              icon={item.icon}
              isActive={item.isActive}
              title={item.title}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <UserProfileDropdown />
      </div>
    </nav>
  );
};

const NavigationItem: React.FC<{
  to: string;
  icon?: React.ComponentType<{ size?: number }>;
  isActive: boolean;
  title: string;
}> = ({ to, icon: Icon, isActive, title }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      {Icon && <Icon size={18} />}
      <span>{title}</span>
    </Link>
  );
};
```

### Role-Based Redirects

```typescript
// components/RoleRedirect.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-user";

export const RoleRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Redirect based on user role and status
  if (user?.role === "ADMIN") {
    return <Navigate to="/admin" replace />;
  }

  if (user?.role === "SUPPLIER") {
    const supplierStatus = user.supplier?.status;

    if (supplierStatus === "PENDING") {
      return <Navigate to="/supplier/application/pending" replace />;
    }

    if (supplierStatus === "REJECTED") {
      return <Navigate to="/supplier/application/rejected" replace />;
    }

    if (supplierStatus === "APPROVED") {
      return <Navigate to="/supplier" replace />;
    }

    // No supplier profile yet
    return <Navigate to="/supplier/application" replace />;
  }

  // Default redirect for regular users
  return <Navigate to="/dashboard" replace />;
};
```

---

## Navigation Components

### Breadcrumb Component

```typescript
// components/Breadcrumb.tsx
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    ...pathnames.map((pathname, index) => {
      const href = `/${pathnames.slice(0, index + 1).join("/")}`;
      const isActive = index === pathnames.length - 1;

      return {
        label: pathname.charAt(0).toUpperCase() + pathname.slice(1),
        href: isActive ? undefined : href,
        isActive,
      };
    }),
  ];

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Home size={16} />
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          {index > 0 && <ChevronRight size={14} />}
          {item.href && !item.isActive ? (
            <Link
              to={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={item.isActive ? "text-foreground font-medium" : ""}
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
```

### Back Button Component

```typescript
// components/BackButton.tsx
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackButtonProps {
  fallbackPath?: string;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath = "/",
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's a state with previous location
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Check if browser has history
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackPath);
      }
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
      <ArrowLeft size={16} className="mr-2" />
      {children || "Back"}
    </Button>
  );
};
```

---

## Route Guards

### Conditional Route Guard

```typescript
// components/ConditionalRouteGuard.tsx
interface ConditionalRouteGuardProps {
  children: React.ReactNode;
  condition: boolean;
  fallback: React.ReactNode;
  redirectTo?: string;
}

export const ConditionalRouteGuard: React.FC<ConditionalRouteGuardProps> = ({
  children,
  condition,
  fallback,
  redirectTo,
}) => {
  if (!condition) {
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage example
const SupplierProfileGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const hasCompletedProfile = user?.supplier?.businessName;

  return (
    <ConditionalRouteGuard
      condition={!!hasCompletedProfile}
      fallback={
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Please complete your supplier profile to access this section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/supplier/profile">
              <Button>Complete Profile</Button>
            </Link>
          </CardContent>
        </Card>
      }
    >
      {children}
    </ConditionalRouteGuard>
  );
};
```

### Permission-Based Route Guard

```typescript
// components/PermissionGuard.tsx
interface Permission {
  resource: string;
  action: "read" | "write" | "delete" | "admin";
}

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  fallback,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return (
      fallback || (
        <Card className="max-w-md mx-auto mt-8">
          <CardHeader>
            <CardTitle className="text-destructive">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don't have permission to access this resource.
            </p>
          </CardContent>
        </Card>
      )
    );
  }

  return <>{children}</>;
};

// Permissions hook
const usePermissions = () => {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;

    const rolePermissions = {
      USER: ["dashboard:read"],
      SUPPLIER: [
        "dashboard:read",
        "profile:read",
        "profile:write",
        "documents:read",
        "documents:write",
      ],
      ADMIN: [
        "dashboard:read",
        "users:read",
        "users:write",
        "users:delete",
        "suppliers:read",
        "suppliers:write",
        "suppliers:admin",
      ],
    };

    const userPermissions = rolePermissions[user.role] || [];
    const requiredPermission = `${permission.resource}:${permission.action}`;

    return userPermissions.includes(requiredPermission);
  };

  return { hasPermission };
};
```

---

## Dynamic Routing

### Route Parameters

```typescript
// pages/admin/UserDetails.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@/hooks/api/useUsers";

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: user, isLoading, error } = useUser(id!);

  if (isLoading) return <Loading />;

  if (error || !user) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-destructive">User Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The requested user could not be found.
          </p>
          <Button className="mt-4" onClick={() => navigate("/admin/users")}>
            Back to Users
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{user.email}</h1>
          <p className="text-muted-foreground">User Details</p>
        </div>
        <BackButton fallbackPath="/admin/users" />
      </div>

      <UserDetailsTabs user={user} />
    </div>
  );
};
```

### Search Parameters

```typescript
// hooks/use-search-params.ts
import { useSearchParams as useRouterSearchParams } from "react-router-dom";
import { useCallback } from "react";

export const useSearchParams = () => {
  const [searchParams, setSearchParams] = useRouterSearchParams();

  const getParam = useCallback(
    (key: string): string | null => {
      return searchParams.get(key);
    },
    [searchParams]
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      if (value === null || value === "") {
        searchParams.delete(key);
      } else {
        searchParams.set(key, value);
      }
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  const setParams = useCallback(
    (params: Record<string, string | null>) => {
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          searchParams.delete(key);
        } else {
          searchParams.set(key, value);
        }
      });
      setSearchParams(searchParams);
    },
    [searchParams, setSearchParams]
  );

  const clearParams = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  return {
    searchParams,
    getParam,
    setParam,
    setParams,
    clearParams,
  };
};

// Usage in component
const AdminUsers: React.FC = () => {
  const { getParam, setParam } = useSearchParams();

  const filters = {
    page: parseInt(getParam("page") || "1"),
    search: getParam("search") || "",
    role: getParam("role") || "all",
    status: getParam("status") || "all",
  };

  const { data: users, isLoading } = useUsers(filters);

  const updateFilter = (key: string, value: string) => {
    setParam(key, value);
    if (key !== "page") {
      setParam("page", "1"); // Reset to first page when filter changes
    }
  };

  return (
    <div>
      <UserFilters filters={filters} onFilterChange={updateFilter} />
      <UsersList users={users} isLoading={isLoading} />
    </div>
  );
};
```

---

## Query Parameters

### URL State Management

```typescript
// hooks/use-url-state.ts
import { useSearchParams } from "./use-search-params";
import { useCallback } from "react";

type SerializableValue = string | number | boolean | null | undefined;

export const useUrlState = <T extends Record<string, SerializableValue>>(
  defaultState: T
) => {
  const { searchParams, setParams } = useSearchParams();

  const state = useCallback((): T => {
    const urlState: Partial<T> = {};

    Object.keys(defaultState).forEach((key) => {
      const value = searchParams.get(key);
      if (value !== null) {
        const defaultValue = defaultState[key as keyof T];

        if (typeof defaultValue === "number") {
          urlState[key as keyof T] = parseInt(value) as T[keyof T];
        } else if (typeof defaultValue === "boolean") {
          urlState[key as keyof T] = (value === "true") as T[keyof T];
        } else {
          urlState[key as keyof T] = value as T[keyof T];
        }
      }
    });

    return { ...defaultState, ...urlState };
  }, [searchParams, defaultState]);

  const setState = useCallback(
    (newState: Partial<T>) => {
      const params: Record<string, string | null> = {};

      Object.entries(newState).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params[key] = null;
        } else {
          params[key] = String(value);
        }
      });

      setParams(params);
    },
    [setParams]
  );

  return [state(), setState] as const;
};

// Usage example
const SuppliersList: React.FC = () => {
  const [filters, setFilters] = useUrlState({
    page: 1,
    search: "",
    status: "all",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const { data: suppliers } = useSuppliers(filters);

  const updateFilters = (updates: Partial<typeof filters>) => {
    setFilters(updates);
  };

  return (
    <div>
      <SupplierFilters filters={filters} onChange={updateFilters} />
      <SuppliersTable suppliers={suppliers} />
    </div>
  );
};
```

---

## Nested Routes

### Layout Components

```typescript
// components/layouts/AdminLayout.tsx
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { TopBar } from "./TopBar";
import { Breadcrumb } from "@/components/Breadcrumb";

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1">
          <TopBar />
          <main className="p-6">
            <div className="mb-6">
              <Breadcrumb />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

// components/layouts/SupplierLayout.tsx
export const SupplierLayout: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <SupplierSidebar />
        <div className="flex-1">
          <TopBar />
          <main className="p-6">
            {user?.supplier?.status === "PENDING" && (
              <Alert className="mb-6">
                <Clock className="h-4 w-4" />
                <AlertTitle>Application Under Review</AlertTitle>
                <AlertDescription>
                  Your supplier application is currently being reviewed. You'll
                  be notified once the review is complete.
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-6">
              <Breadcrumb />
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
```

---

## Route Transitions

### Page Transitions

```typescript
// components/PageTransition.tsx
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const pageVariants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  in: {
    opacity: 1,
    x: 0,
  },
  out: {
    opacity: 0,
    x: 20,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

export const PageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Usage in route components
const Dashboard: React.FC = () => {
  return (
    <PageTransition>
      <div>
        <h1>Dashboard</h1>
        {/* Dashboard content */}
      </div>
    </PageTransition>
  );
};
```

---

## Error Boundaries

### Route-Specific Error Boundaries

```typescript
// components/RouteErrorBoundary.tsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">
              {error.status === 404 ? "Page Not Found" : "Page Error"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {error.status === 404
                ? "The page you are looking for does not exist."
                : error.statusText ||
                  "An error occurred while loading this page."}
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.history.back()}>Go Back</Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/")}
              >
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="text-destructive">Unexpected Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## SEO and Meta Tags

### Dynamic Meta Tags

```typescript
// hooks/use-meta-tags.ts
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface MetaTag {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  robots?: string;
}

export const useMetaTags = (metaTags: MetaTag) => {
  const location = useLocation();

  useEffect(() => {
    // Update title
    if (metaTags.title) {
      document.title = `${metaTags.title} | Suppliers Dashboard`;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content?: string) => {
      if (!content) return;

      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaTag("description", metaTags.description);
    updateMetaTag("keywords", metaTags.keywords);
    updateMetaTag("author", metaTags.author);
    updateMetaTag("robots", metaTags.robots);

    // Update Open Graph tags
    const updateOGTag = (property: string, content?: string) => {
      if (!content) return;

      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateOGTag("og:title", metaTags.title);
    updateOGTag("og:description", metaTags.description);
    updateOGTag("og:url", window.location.href);
  }, [metaTags, location.pathname]);
};

// Usage in components
const AdminUsers: React.FC = () => {
  useMetaTags({
    title: "User Management",
    description: "Manage platform users and their roles",
    keywords: "users, management, admin, roles",
    robots: "noindex, nofollow", // Admin pages shouldn't be indexed
  });

  return (
    <div>
      <h1>User Management</h1>
      {/* Component content */}
    </div>
  );
};
```

---

**Note**: This comprehensive routing guide ensures secure, efficient, and user-friendly navigation throughout the entire Suppliers Dashboard frontend application, with role-based access control, dynamic routing capabilities, and optimal user experience patterns.
