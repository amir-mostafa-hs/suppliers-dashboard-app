# Frontend - Project Overview

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Core Features](#core-features)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Routing Strategy](#routing-strategy)
- [UI/UX Design System](#uiux-design-system)
- [API Integration](#api-integration)
- [Build & Deployment](#build--deployment)

---

## Project Overview

The Suppliers Dashboard Frontend is a modern React-based web application that provides an intuitive interface for supplier management, user authentication, and administrative functions. Built with TypeScript and Vite for optimal performance and developer experience.

### Purpose

- **Supplier Management**: Complete supplier application workflow
- **User Authentication**: Secure login/registration system
- **Admin Dashboard**: Comprehensive administrative interface
- **Document Management**: Secure file upload and viewing
- **Real-time Updates**: Live status updates and notifications

### Target Users

- **Suppliers**: Business owners applying for supplier status
- **Administrators**: Staff managing supplier applications
- **General Users**: Basic system access and profile management

---

## Technology Stack

### Core Framework

```json
{
  "framework": "React 18.3.1",
  "language": "TypeScript 5.5.3",
  "build_tool": "Vite 5.4.1",
  "package_manager": "pnpm 9.9.0"
}
```

### UI & Styling

- **UI Library**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4.10
- **Icons**: Lucide React
- **Animations**: Framer Motion (via Shadcn)
- **Responsive Design**: Mobile-first approach

### State Management & API

- **HTTP Client**: Axios for API communication
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Authentication**: JWT token management with HTTP-only cookies
- **Local Storage**: Minimal use, security-focused

### Development Tools

- **Linting**: ESLint with TypeScript rules
- **Type Checking**: TypeScript strict mode
- **Hot Reload**: Vite HMR (Hot Module Replacement)
- **PostCSS**: Tailwind CSS processing
- **Path Aliases**: Clean import statements

---

## Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Application                      │
├─────────────────────────────────────────────────────────────┤
│                        App.tsx                              │
│           (Main routing and global providers)               │
├─────────────────────────────────────────────────────────────┤
│     Pages           │    Components      │    Hooks         │
│  ┌─────────────┐   │  ┌─────────────┐   │  ┌─────────────┐ │
│  │ Dashboard   │   │  │ Navigation  │   │  │ useUser     │ │
│  │ Auth        │   │  │ Loading     │   │  │ useMobile   │ │
│  │ Supplier    │   │  │ UI/Common   │   │  │ useToast    │ │
│  │ Admin       │   │  │ Forms       │   │  └─────────────┘ │
│  └─────────────┘   │  └─────────────┘   │                  │
├─────────────────────────────────────────────────────────────┤
│              Shared Services & Utilities                    │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────────┐   │
│  │ API Client  │   │ Utils       │   │ Configuration   │   │
│  │ (Axios)     │   │ (Helpers)   │   │ (Environment)   │   │
│  └─────────────┘   └─────────────┘   └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
User Action → Component → Custom Hook → API Call → Backend
     ↓              ↑           ↑           ↑           ↓
   UI Update ← State Update ← Response ← Processing ← Database
```

---

## Project Structure

### Root Directory Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.ico        # App icon
│   ├── placeholder.svg    # Default images
│   └── robots.txt         # SEO configuration
├── src/                   # Source code
│   ├── components/        # React components
│   ├── pages/            # Route components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and API client
│   └── config/           # Configuration files
├── docs/                 # Documentation (this folder)
└── [config files]       # Build and development configs
```

### Source Code Organization

```
src/
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
├── index.css            # Global styles
├── vite-env.d.ts        # Vite type definitions
│
├── components/          # Reusable components
│   ├── Loading.tsx      # Loading spinner component
│   ├── Navigation.tsx   # Main navigation component
│   └── ui/             # Shadcn/ui components (40+ components)
│
├── pages/              # Page components (routes)
│   ├── Dashboard.tsx    # Main dashboard page
│   ├── Index.tsx        # Home/landing page
│   ├── NotFound.tsx     # 404 error page
│   ├── admin/          # Admin-specific pages
│   │   ├── AdminDashboard.tsx
│   │   └── SupplierDetail.tsx
│   ├── auth/           # Authentication pages
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── supplier/       # Supplier-specific pages
│       ├── SupplierApply.tsx
│       └── SupplierProfile.tsx
│
├── hooks/              # Custom React hooks
│   ├── use-mobile.tsx   # Mobile device detection
│   ├── use-toast.ts     # Toast notification system
│   └── use-user.ts      # User authentication state
│
├── lib/                # Utilities and services
│   ├── utils.ts         # Common utility functions
│   └── api/            # API communication
│       └── axios.ts     # Axios configuration
│
└── config/             # Configuration
    └── secret-variable.ts # Environment variables
```

---

## Core Features

### 1. Authentication System

- **User Registration**: Email/password registration with role selection
- **User Login**: Secure JWT authentication with HTTP-only cookies
- **Role Management**: USER, SUPPLIER, ADMIN role-based access
- **Session Management**: Automatic token refresh and logout
- **Protected Routes**: Route guards based on authentication status

### 2. Supplier Management

- **Application Process**: Multi-step supplier application form
- **Document Upload**: Secure PDF file upload with validation
- **Status Tracking**: Real-time application status updates
- **Profile Management**: Edit and update supplier information
- **Document Management**: View and manage uploaded documents

### 3. Admin Dashboard

- **User Management**: View and manage all system users
- **Application Review**: Approve or reject supplier applications
- **Document Access**: Secure access to supplier documents
- **Statistics**: Real-time system statistics and metrics
- **Bulk Operations**: Manage multiple applications efficiently

### 4. User Interface

- **Responsive Design**: Mobile-first responsive layout
- **Dark/Light Mode**: Theme switching capability (future enhancement)
- **Accessibility**: WCAG compliant interface
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

---

## Component Architecture

### UI Component Hierarchy

```
App
├── Navigation (always visible)
├── Router Switch
│   ├── Public Routes
│   │   ├── Index (landing page)
│   │   ├── Login
│   │   └── Register
│   └── Protected Routes
│       ├── Dashboard (role-based content)
│       ├── Supplier Routes
│       │   ├── SupplierApply
│       │   └── SupplierProfile
│       └── Admin Routes
│           ├── AdminDashboard
│           └── SupplierDetail
└── Global Components
    ├── Loading (conditional)
    ├── Toast Notifications
    └── Error Boundaries
```

### Component Design Patterns

#### 1. Container/Presentation Pattern

```typescript
// Container Component (logic)
const SupplierProfileContainer = () => {
  const { data, isLoading, error } = useQuery("supplier-profile", fetchProfile);

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage />;

  return <SupplierProfilePresentation data={data} />;
};

// Presentation Component (UI)
const SupplierProfilePresentation = ({ data }) => {
  return <div className="supplier-profile">{/* UI rendering */}</div>;
};
```

#### 2. Custom Hook Pattern

```typescript
// Custom hook for reusable logic
const useSupplierData = (supplierId: string) => {
  const { data, isLoading, error, refetch } = useQuery(
    ["supplier", supplierId],
    () => apiClient.get(`/supplier/${supplierId}`),
    {
      enabled: !!supplierId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return { supplier: data?.data, isLoading, error, refetch };
};
```

### Shadcn/ui Component Library

#### Available Components (40+ components)

```typescript
// Form Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

// Layout Components
import { Card } from "@/components/ui/card";
import { Sheet } from "@/components/ui/sheet";
import { Dialog } from "@/components/ui/dialog";
import { Tabs } from "@/components/ui/tabs";

// Feedback Components
import { Alert } from "@/components/ui/alert";
import { Toast } from "@/components/ui/toast";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Navigation Components
import { NavigationMenu } from "@/components/ui/navigation-menu";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
```

---

## State Management

### React Query (TanStack Query)

```typescript
// Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Usage patterns
const useUsers = () => {
  return useQuery("users", apiClient.getUsers, {
    select: (data) => data.data,
    onError: (error) => {
      toast.error("Failed to fetch users");
    },
  });
};

const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation(apiClient.createSupplier, {
    onSuccess: () => {
      queryClient.invalidateQueries("suppliers");
      toast.success("Supplier created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create supplier");
    },
  });
};
```

### Local State Management

```typescript
// useState for component-level state
const [formData, setFormData] = useState({
  businessName: "",
  email: "",
  phone: "",
});

// useReducer for complex state logic
const [state, dispatch] = useReducer(formReducer, initialState);

// Custom hooks for shared state
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Authentication logic
  return { user, isAuthenticated, login, logout };
};
```

---

## Routing Strategy

### React Router Configuration

```typescript
// App.tsx routing structure
<BrowserRouter>
  <Routes>
    {/* Public Routes */}
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    {/* Protected Routes */}
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* Supplier Routes */}
    <Route path="/supplier" element={<SupplierRoutes />}>
      <Route path="apply" element={<SupplierApply />} />
      <Route path="profile" element={<SupplierProfile />} />
    </Route>

    {/* Admin Routes */}
    <Route path="/admin" element={<AdminRoutes />}>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="suppliers/:id" element={<SupplierDetail />} />
    </Route>

    {/* 404 Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
</BrowserRouter>
```

### Route Protection

```typescript
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
```

---

## UI/UX Design System

### Design Principles

- **Consistency**: Unified design language across all components
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Optimized rendering and minimal bundle size
- **Mobile-First**: Responsive design starting from mobile
- **User-Centric**: Intuitive navigation and clear feedback

### Tailwind CSS Configuration

```typescript
// tailwind.config.ts
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... additional color system
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Responsive Breakpoints

```css
/* Mobile First Approach */
/* xs: 475px */
/* sm: 640px */
/* md: 768px */
/* lg: 1024px */
/* xl: 1280px */
/* 2xl: 1536px */

.responsive-grid {
  @apply grid grid-cols-1 gap-4;
  @apply sm:grid-cols-2;
  @apply md:grid-cols-3;
  @apply lg:grid-cols-4;
}
```

### Color System

```css
:root {
  /* Light theme */
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  /* ... additional colors */
}

.dark {
  /* Dark theme variables */
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark theme colors */
}
```

---

## API Integration

### Axios Configuration

```typescript
// lib/api/axios.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  timeout: 10000,
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request logging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

### API Service Layer

```typescript
// API service functions
export const authApi = {
  register: (userData) => apiClient.post("/auth/register", userData),
  login: (credentials) => apiClient.post("/auth/login", credentials),
  logout: () => apiClient.post("/auth/logout"),
  getCurrentUser: () => apiClient.get("/auth/me"),
};

export const supplierApi = {
  createProfile: (profileData) =>
    apiClient.post("/supplier/profile", profileData),
  getProfile: () => apiClient.get("/supplier/profile"),
  updateProfile: (profileData) =>
    apiClient.put("/supplier/profile", profileData),
  uploadDocuments: (formData) =>
    apiClient.post("/supplier/upload-documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const adminApi = {
  getAllUsers: (params) => apiClient.get("/admin/users", { params }),
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  approveSupplier: (id, data) =>
    apiClient.post(`/admin/users/${id}/approve`, data),
  rejectSupplier: (id, data) =>
    apiClient.post(`/admin/users/${id}/reject`, data),
};
```

---

## Build & Deployment

### Development Build

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  }
}
```

### Production Optimization

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image and font optimization
- **Bundling**: Optimized bundle sizes with Vite
- **Caching**: Browser caching strategies

### Environment Configuration

```typescript
// config/secret-variable.ts
export const SECRET_VARIABLES = {
  api_base_url:
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
  app_name: import.meta.env.VITE_APP_NAME || "Suppliers Dashboard",
  environment: import.meta.env.MODE || "development",
} as const;
```

### Build Output Structure

```
dist/                    # Production build output
├── assets/             # Optimized assets
│   ├── index-[hash].js # Main application bundle
│   ├── index-[hash].css # Compiled styles
│   └── [other-assets]  # Images, fonts, etc.
├── index.html          # Main HTML file
└── [static-files]      # Public directory contents
```

---

## Performance Considerations

### Bundle Size Optimization

- **Dynamic Imports**: Lazy loading for route components
- **Tree Shaking**: Remove unused dependencies
- **Code Splitting**: Separate vendor and application code
- **Asset Optimization**: Compress images and fonts

### Runtime Performance

- **React Query Caching**: Minimize API calls
- **Component Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: Handle large data sets efficiently
- **Image Lazy Loading**: Load images on demand

### Development Experience

- **Hot Module Replacement**: Instant updates during development
- **TypeScript**: Type safety and IDE support
- **ESLint**: Code quality and consistency
- **Fast Build Times**: Vite's optimized build process

---

**Note**: This frontend architecture provides a solid foundation for a modern, scalable React application with excellent developer experience and user interface design.
