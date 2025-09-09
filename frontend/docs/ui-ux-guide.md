# Frontend - UI/UX Design Guide

**Last Updated:** September 9, 2025  
**Author:** Frontend Development Team  
**Status:** Active

## Table of Contents

- [Design System Overview](#design-system-overview)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Component Library](#component-library)
- [Layout Patterns](#layout-patterns)
- [Responsive Design](#responsive-design)
- [Accessibility Guidelines](#accessibility-guidelines)
- [User Experience Patterns](#user-experience-patterns)
- [Form Design](#form-design)
- [Data Visualization](#data-visualization)
- [Loading States](#loading-states)
- [Error Handling](#error-handling)
- [Mobile Design](#mobile-design)

---

## Design System Overview

The Suppliers Dashboard UI/UX design system is built on modern web design principles, prioritizing accessibility, consistency, and user experience. The system leverages Shadcn/ui components with Tailwind CSS for styling, providing a cohesive and scalable design foundation.

### Design Philosophy

- **User-Centered Design**: Every decision prioritizes user needs and workflows
- **Accessibility First**: WCAG 2.1 AA compliance throughout the application
- **Consistency**: Standardized patterns, components, and interactions
- **Performance**: Optimized for speed and smooth user experience
- **Responsive**: Mobile-first approach with seamless cross-device experience
- **Professional**: Clean, modern aesthetic suitable for business environments

### Design Tokens

```css
/* Design tokens implementation */
:root {
  /* Spacing Scale */
  --spacing-0: 0;
  --spacing-1: 0.25rem; /* 4px */
  --spacing-2: 0.5rem; /* 8px */
  --spacing-3: 0.75rem; /* 12px */
  --spacing-4: 1rem; /* 16px */
  --spacing-5: 1.25rem; /* 20px */
  --spacing-6: 1.5rem; /* 24px */
  --spacing-8: 2rem; /* 32px */
  --spacing-10: 2.5rem; /* 40px */
  --spacing-12: 3rem; /* 48px */
  --spacing-16: 4rem; /* 64px */

  /* Border Radius */
  --radius-sm: 0.125rem; /* 2px */
  --radius: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 /
          0.1);

  /* Animation Durations */
  --duration-75: 75ms;
  --duration-100: 100ms;
  --duration-150: 150ms;
  --duration-200: 200ms;
  --duration-300: 300ms;
  --duration-500: 500ms;
  --duration-700: 700ms;
  --duration-1000: 1000ms;

  /* Z-Index Scale */
  --z-hide: -1;
  --z-auto: auto;
  --z-base: 0;
  --z-docked: 10;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-banner: 1200;
  --z-overlay: 1300;
  --z-modal: 1400;
  --z-popover: 1500;
  --z-skipLink: 1600;
  --z-toast: 1700;
  --z-tooltip: 1800;
}
```

---

## Color Palette

### Primary Color System

```css
/* Light Theme Colors */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}

/* Dark Theme Colors */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --popover: 222.2 84% 4.9%;
  --popover-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 84% 4.9%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 94.1%;
}
```

### Semantic Color Usage

```typescript
// Color usage guidelines
export const colorUsage = {
  primary: {
    description:
      "Main brand color for buttons, links, and key interactive elements",
    usage: [
      "Primary buttons",
      "Navigation active states",
      "Key CTAs",
      "Progress indicators",
    ],
    examples: ["Submit buttons", "Login button", "Active nav items"],
  },
  secondary: {
    description: "Supporting color for less prominent interactive elements",
    usage: ["Secondary buttons", "Subtle backgrounds", "Inactive states"],
    examples: ["Cancel buttons", "Card backgrounds", "Disabled elements"],
  },
  destructive: {
    description: "Error states and destructive actions",
    usage: [
      "Error messages",
      "Delete buttons",
      "Warning states",
      "Validation errors",
    ],
    examples: ["Form errors", "Delete confirmations", "Failed uploads"],
  },
  success: {
    description: "Success states and positive feedback",
    usage: ["Success messages", "Completed states", "Positive indicators"],
    examples: ["Success toasts", "Approved status", "Upload complete"],
  },
  warning: {
    description: "Warning states and caution indicators",
    usage: ["Warning messages", "Pending states", "Attention needed"],
    examples: ["Pending approval", "Form warnings", "Account alerts"],
  },
  muted: {
    description: "Subtle text and backgrounds",
    usage: [
      "Helper text",
      "Placeholders",
      "Subtle backgrounds",
      "Disabled text",
    ],
    examples: ["Form help text", "Timestamps", "Card subtitles"],
  },
};
```

---

## Typography

### Font System

```css
/* Typography Scale */
:root {
  /* Font Families */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
  --font-serif: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Consolas,
    "Liberation Mono", Menlo, monospace;

  /* Font Sizes */
  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem; /* 36px */
  --text-5xl: 3rem; /* 48px */
  --text-6xl: 3.75rem; /* 60px */

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;

  /* Font Weights */
  --font-thin: 100;
  --font-extralight: 200;
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  --font-black: 900;
}
```

### Typography Components

```typescript
// Typography components with consistent styling
export const Typography = {
  H1: ({ children, className, ...props }: TypographyProps) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  ),

  H2: ({ children, className, ...props }: TypographyProps) => (
    <h2
      className={cn(
        "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  ),

  H3: ({ children, className, ...props }: TypographyProps) => (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  ),

  H4: ({ children, className, ...props }: TypographyProps) => (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  ),

  P: ({ children, className, ...props }: TypographyProps) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    >
      {children}
    </p>
  ),

  Lead: ({ children, className, ...props }: TypographyProps) => (
    <p className={cn("text-xl text-muted-foreground", className)} {...props}>
      {children}
    </p>
  ),

  Large: ({ children, className, ...props }: TypographyProps) => (
    <div className={cn("text-lg font-semibold", className)} {...props}>
      {children}
    </div>
  ),

  Small: ({ children, className, ...props }: TypographyProps) => (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    >
      {children}
    </small>
  ),

  Muted: ({ children, className, ...props }: TypographyProps) => (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  ),

  Code: ({ children, className, ...props }: TypographyProps) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
};

// Usage example
const UserProfile: React.FC = () => {
  return (
    <div className="space-y-4">
      <Typography.H1>User Profile</Typography.H1>
      <Typography.Lead>
        Manage your account settings and preferences
      </Typography.Lead>

      <div className="grid gap-6">
        <section>
          <Typography.H3>Personal Information</Typography.H3>
          <Typography.Muted>
            Update your personal details below
          </Typography.Muted>
        </section>
      </div>
    </div>
  );
};
```

---

## Component Library

### Button Variants

```typescript
// Button component with comprehensive variants
export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Button usage patterns
const ButtonExamples: React.FC = () => {
  return (
    <div className="space-y-4">
      {/* Primary Actions */}
      <div className="flex gap-2">
        <Button>Primary Action</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
      </div>

      {/* Destructive Actions */}
      <div className="flex gap-2">
        <Button variant="destructive">Delete User</Button>
        <Button variant="destructive" size="sm">
          Remove
        </Button>
      </div>

      {/* Loading States */}
      <div className="flex gap-2">
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      </div>

      {/* Icon Buttons */}
      <div className="flex gap-2">
        <Button size="icon">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
```

### Form Components

```typescript
// Comprehensive form component patterns
export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, className, ...props }, ref) => {
    const id = useId();

    return (
      <div className={cn("space-y-2", className)}>
        {label && (
          <Label
            htmlFor={id}
            className={
              required
                ? "after:content-['*'] after:text-destructive after:ml-1"
                : ""
            }
          >
            {label}
          </Label>
        )}

        <Input
          id={id}
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive"
          )}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-help` : undefined
          }
          {...props}
        />

        {error && (
          <p
            id={`${id}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={`${id}-help`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Select component with enhanced UX
export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  error,
  helperText,
  required,
  className,
}) => {
  const id = useId();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label
          htmlFor={id}
          className={
            required
              ? "after:content-['*'] after:text-destructive after:ml-1"
              : ""
          }
        >
          {label}
        </Label>
      )}

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={id}
          className={cn(error && "border-destructive focus:ring-destructive")}
          aria-describedby={
            error ? `${id}-error` : helperText ? `${id}-help` : undefined
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p id={`${id}-help`} className="text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
};

// Multi-step form component
export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  currentStep,
  onStepChange,
  children,
}) => {
  return (
    <div className="space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>

            <div className="ml-3">
              <p
                className={cn(
                  "text-sm font-medium",
                  index <= currentStep
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mx-4",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="min-h-[400px]">{children}</div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <Button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
        </Button>
      </div>
    </div>
  );
};
```

---

## Layout Patterns

### Grid System

```typescript
// Responsive grid system
export const Grid = {
  Container: ({ children, className, ...props }: ContainerProps) => (
    <div
      className={cn("container mx-auto px-4 sm:px-6 lg:px-8", className)}
      {...props}
    >
      {children}
    </div>
  ),

  Row: ({ children, className, gap = "md", ...props }: RowProps) => (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-12",
        {
          "gap-2": gap === "sm",
          "gap-4": gap === "md",
          "gap-6": gap === "lg",
          "gap-8": gap === "xl",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),

  Col: ({ children, className, span = 12, offset = 0, ...props }: ColProps) => (
    <div
      className={cn(
        `md:col-span-${span}`,
        offset > 0 && `md:col-start-${offset + 1}`,
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
};

// Common layout patterns
export const LayoutPatterns = {
  // Sidebar layout
  SidebarLayout: ({ sidebar, children, className }: SidebarLayoutProps) => (
    <div className={cn("flex min-h-screen", className)}>
      <aside className="w-64 bg-card border-r border-border hidden lg:block">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  ),

  // Two column layout
  TwoColumnLayout: ({ left, right, className }: TwoColumnLayoutProps) => (
    <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
      <div className="lg:col-span-2">{left}</div>
      <div className="lg:col-span-1">{right}</div>
    </div>
  ),

  // Three column layout
  ThreeColumnLayout: ({
    left,
    center,
    right,
    className,
  }: ThreeColumnLayoutProps) => (
    <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-6", className)}>
      <div className="md:col-span-1">{left}</div>
      <div className="md:col-span-2">{center}</div>
      <div className="md:col-span-1">{right}</div>
    </div>
  ),

  // Card grid layout
  CardGrid: ({ children, columns = "auto", className }: CardGridProps) => (
    <div
      className={cn(
        "grid gap-6",
        {
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4":
            columns === "auto",
          "grid-cols-1 sm:grid-cols-2": columns === 2,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4":
            columns === 4,
        },
        className
      )}
    >
      {children}
    </div>
  ),
};
```

### Page Templates

```typescript
// Standard page templates
export const PageTemplates = {
  // Dashboard page template
  Dashboard: ({ title, subtitle, actions, children }: DashboardPageProps) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography.H1>{title}</Typography.H1>
          {subtitle && (
            <Typography.Muted className="mt-2">{subtitle}</Typography.Muted>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      <div className="grid gap-6">{children}</div>
    </div>
  ),

  // List page template
  ListPage: ({
    title,
    subtitle,
    actions,
    filters,
    children,
    pagination,
  }: ListPageProps) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Typography.H1>{title}</Typography.H1>
          {subtitle && (
            <Typography.Muted className="mt-2">{subtitle}</Typography.Muted>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {filters && (
        <Card>
          <CardContent className="pt-6">{filters}</CardContent>
        </Card>
      )}

      <div className="space-y-4">{children}</div>

      {pagination && <div className="flex justify-center">{pagination}</div>}
    </div>
  ),

  // Detail page template
  DetailPage: ({
    title,
    subtitle,
    actions,
    breadcrumb,
    tabs,
    children,
  }: DetailPageProps) => (
    <div className="space-y-6">
      {breadcrumb && <Breadcrumb />}

      <div className="flex items-center justify-between">
        <div>
          <Typography.H1>{title}</Typography.H1>
          {subtitle && (
            <Typography.Muted className="mt-2">{subtitle}</Typography.Muted>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {tabs && (
        <Tabs defaultValue={tabs[0].value}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!tabs && <div className="grid gap-6">{children}</div>}
    </div>
  ),

  // Form page template
  FormPage: ({
    title,
    subtitle,
    breadcrumb,
    children,
    onSubmit,
    onCancel,
  }: FormPageProps) => (
    <div className="space-y-6">
      {breadcrumb && <Breadcrumb />}

      <div>
        <Typography.H1>{title}</Typography.H1>
        {subtitle && (
          <Typography.Muted className="mt-2">{subtitle}</Typography.Muted>
        )}
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          <form onSubmit={onSubmit} className="space-y-6">
            {children}

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  ),
};
```

---

## Responsive Design

### Breakpoint System

```typescript
// Responsive breakpoints
export const breakpoints = {
  sm: "640px", // Small devices (landscape phones)
  md: "768px", // Medium devices (tablets)
  lg: "1024px", // Large devices (laptops)
  xl: "1280px", // Extra large devices (desktops)
  "2xl": "1536px", // 2X large devices (large desktops)
};

// Media query utilities
export const mediaQueries = {
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  "2xl": `@media (min-width: ${breakpoints["2xl"]})`,
};

// Responsive utilities hook
export const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width >= 768 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  };
};
```

### Responsive Components

```typescript
// Responsive navigation component
export const ResponsiveNavigation: React.FC = () => {
  const { isMobile } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <div className="flex items-center justify-between p-4 border-b">
          <Logo />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <MobileNavigationItems />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <nav className="w-64 bg-card border-r border-border">
      <div className="p-4">
        <Logo />
      </div>
      <DesktopNavigationItems />
    </nav>
  );
};

// Responsive table component
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  data,
  columns,
  mobileCardRenderer,
}) => {
  const { isMobile } = useResponsive();

  if (isMobile && mobileCardRenderer) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              {mobileCardRenderer(item)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>{column.title}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {column.render ? column.render(item) : item[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

## Accessibility Guidelines

### ARIA Implementation

```typescript
// Accessible form components
export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  required,
  type = "text",
  ...props
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className={
          required
            ? "after:content-['*'] after:text-destructive after:ml-1"
            : ""
        }
      >
        {label}
        {required && <span className="sr-only">(required)</span>}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        aria-invalid={!!error}
        aria-describedby={cn(error && errorId, helperText && helpId)}
        className={cn(error && "border-destructive focus:ring-destructive")}
        {...props}
      />

      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {helperText && !error && (
        <div id={helpId} className="text-sm text-muted-foreground">
          {helperText}
        </div>
      )}
    </div>
  );
};

// Accessible modal component
export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
}) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        <DialogHeader>
          <DialogTitle id={titleId}>{title}</DialogTitle>
          {description && (
            <DialogDescription id={descriptionId}>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">{children}</div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Skip to content link
export const SkipToContent: React.FC = () => {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
    >
      Skip to main content
    </a>
  );
};
```

### Keyboard Navigation

```typescript
// Keyboard navigation utilities
export const useKeyboardNavigation = (
  items: string[],
  onSelect: (item: string) => void
) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setActiveIndex((prev) => (prev + 1) % items.length);
          break;
        case "ArrowUp":
          event.preventDefault();
          setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onSelect(items[activeIndex]);
          break;
        case "Escape":
          event.preventDefault();
          setActiveIndex(0);
          break;
      }
    },
    [items, activeIndex, onSelect]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { activeIndex, setActiveIndex };
};

// Focus management hook
export const useFocusManagement = () => {
  const focusableSelector = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");

  const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
    return Array.from(container.querySelectorAll(focusableSelector));
  };

  const trapFocus = (container: HTMLElement) => {
    const focusableElements = getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  };

  return { getFocusableElements, trapFocus };
};
```

---

## User Experience Patterns

### Loading States

```typescript
// Comprehensive loading state components
export const LoadingStates = {
  // Skeleton loaders
  CardSkeleton: () => (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
    </Card>
  ),

  TableSkeleton: ({
    rows = 5,
    columns = 4,
  }: {
    rows?: number;
    columns?: number;
  }) => (
    <div className="space-y-3">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  ),

  // Spinner with message
  Spinner: ({
    message,
    size = "md",
  }: {
    message?: string;
    size?: "sm" | "md" | "lg";
  }) => (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2
        className={cn("animate-spin text-primary", {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        })}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  ),

  // Progressive loading
  ProgressiveLoader: ({
    progress,
    message,
  }: {
    progress: number;
    message?: string;
  }) => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-2xl font-bold">{progress}%</div>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  ),
};

// Loading state hook
export const useLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }));
  };

  const isLoading = (key: string) => loadingStates[key] || false;
  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return { setLoading, isLoading, isAnyLoading };
};
```

### Empty States

```typescript
// Empty state components
export const EmptyStates = {
  Generic: ({
    icon: Icon = FileText,
    title,
    description,
    action,
  }: EmptyStateProps) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <Typography.H3 className="mb-2">{title}</Typography.H3>
      <Typography.Muted className="mb-6 max-w-sm">
        {description}
      </Typography.Muted>
      {action}
    </div>
  ),

  NoResults: ({
    searchTerm,
    onReset,
  }: {
    searchTerm: string;
    onReset: () => void;
  }) => (
    <EmptyStates.Generic
      icon={Search}
      title="No results found"
      description={`No results found for "${searchTerm}". Try adjusting your search criteria.`}
      action={
        <Button variant="outline" onClick={onReset}>
          Clear search
        </Button>
      }
    />
  ),

  NoData: ({
    resourceName,
    onAdd,
  }: {
    resourceName: string;
    onAdd?: () => void;
  }) => (
    <EmptyStates.Generic
      icon={Plus}
      title={`No ${resourceName} yet`}
      description={`You haven't created any ${resourceName} yet. Get started by creating your first one.`}
      action={
        onAdd && (
          <Button onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add {resourceName}
          </Button>
        )
      }
    />
  ),

  Error: ({ onRetry }: { onRetry: () => void }) => (
    <EmptyStates.Generic
      icon={AlertCircle}
      title="Something went wrong"
      description="We encountered an error while loading the data. Please try again."
      action={
        <Button onClick={onRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      }
    />
  ),
};
```

---

## Form Design

### Form Validation

```typescript
// Advanced form validation patterns
export const FormValidation = {
  // Real-time validation hook
  useFormValidation: <T extends Record<string, any>>(
    schema: z.ZodSchema<T>,
    initialValues: T
  ) => {
    const [values, setValues] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>(
      {}
    );

    const validateField = (field: keyof T, value: any) => {
      try {
        const fieldSchema = schema.shape[field as string];
        fieldSchema.parse(value);
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({ ...prev, [field]: error.errors[0].message }));
        }
      }
    };

    const setValue = (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field, value);
      }
    };

    const setTouched = (field: keyof T) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      validateField(field, values[field]);
    };

    const validateAll = () => {
      try {
        schema.parse(values);
        setErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Partial<Record<keyof T, string>> = {};
          error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as keyof T] = err.message;
            }
          });
          setErrors(fieldErrors);
        }
        return false;
      }
    };

    return {
      values,
      errors,
      touched,
      setValue,
      setTouched,
      validateAll,
      isValid: Object.keys(errors).length === 0,
    };
  },

  // Password strength indicator
  PasswordStrength: ({ password }: { password: string }) => {
    const getStrength = (pwd: string) => {
      let score = 0;
      if (pwd.length >= 8) score++;
      if (/[A-Z]/.test(pwd)) score++;
      if (/[a-z]/.test(pwd)) score++;
      if (/[0-9]/.test(pwd)) score++;
      if (/[^A-Za-z0-9]/.test(pwd)) score++;
      return score;
    };

    const strength = getStrength(password);
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
    const strengthColors = [
      "bg-red-500",
      "bg-orange-500",
      "bg-yellow-500",
      "bg-blue-500",
      "bg-green-500",
    ];

    return (
      <div className="space-y-2">
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                "h-2 flex-1 rounded",
                level <= strength ? strengthColors[strength - 1] : "bg-muted"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Password strength: {strengthLabels[strength - 1] || "Very Weak"}
        </p>
      </div>
    );
  },

  // File upload with validation
  FileUploadField: ({
    label,
    accept,
    maxSize,
    maxFiles = 1,
    onFilesChange,
    error,
  }: FileUploadFieldProps) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File size must be less than ${maxSize / 1024 / 1024}MB`;
      }
      if (
        accept &&
        !accept.split(",").some((type) => file.type.match(type.trim()))
      ) {
        return "File type not supported";
      }
      return null;
    };

    const handleFiles = (fileList: FileList) => {
      const newFiles = Array.from(fileList);
      const validFiles: File[] = [];
      const errors: string[] = [];

      newFiles.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          errors.push(`${file.name}: ${error}`);
        } else {
          validFiles.push(file);
        }
      });

      if (validFiles.length + files.length > maxFiles) {
        errors.push(`Maximum ${maxFiles} files allowed`);
      } else {
        const updatedFiles = [...files, ...validFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
      }
    };

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25",
            error && "border-destructive"
          )}
          onDragEnter={() => setDragActive(true)}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Drag files here or{" "}
            <label className="text-primary cursor-pointer">
              browse
              <input
                type="file"
                className="sr-only"
                accept={accept}
                multiple={maxFiles > 1}
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
            </label>
          </p>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <span className="text-sm">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newFiles = files.filter((_, i) => i !== index);
                    setFiles(newFiles);
                    onFilesChange(newFiles);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  },
};
```

---

**Note**: This comprehensive UI/UX design guide ensures consistent, accessible, and user-friendly interface design throughout the entire Suppliers Dashboard frontend application, following modern design principles and best practices.
