import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Building2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  userRole?: "USER" | "SUPPLIER" | "ADMIN";
  supplierStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

const Navigation = ({ darkMode, toggleDarkMode, userRole, supplierStatus }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard" },
    ...(userRole === "ADMIN" ? [
      { path: "/admin/dashboard", label: "Admin Panel" }
    ] : []),
    ...(userRole === "SUPPLIER" && supplierStatus === "APPROVED" ? [
      { path: "/supplier/profile", label: "My Profile" }
    ] : []),
    ...(userRole === "USER" || (userRole === "SUPPLIER" && supplierStatus !== "APPROVED") ? [
      { path: "/supplier/apply", label: "Apply as Supplier" }
    ] : []),
  ];

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">SupplierHub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-9 w-9 p-0"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Link to="/auth/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="h-9 w-9 p-0"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-card">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "block px-3 py-2 rounded-lg text-base font-medium transition-colors",
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="flex space-x-2 pt-4 border-t">
                <Link to="/auth/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">Sign In</Button>
                </Link>
                <Link to="/auth/register" className="flex-1">
                  <Button size="sm" className="w-full">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;