import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Building2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "../hooks/use-user";
import api from "@/lib/api/axios";
import { useQueryClient } from "@tanstack/react-query";

interface NavigationProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navigation = ({ darkMode, toggleDarkMode }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, supplierStatus } = useUser();
  const isAuthenticated = !!user;
  const queryClient = useQueryClient();

  const isActive = (path: string) => location.pathname === path;

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await api.post("/users/logout");
      // Clear all cached queries
      queryClient.clear();
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear queries even if logout fails
      queryClient.clear();
      window.location.href = "/auth/login";
    }
  };

  // Define navigation items based on user role and status
  const navItems = [
    // Always show the dashboard link for USER and ADMIN, but not for suppliers
    ...(isAuthenticated && !user.isSupplier && user.role !== "ADMIN"
      ? [{ path: "/", label: "Home" }]
      : []),
    ...(isAuthenticated && (user.role === "ADMIN" || user.role === "REVIEWER")
      ? [{ path: "/admin/dashboard", label: "Admin Panel" }]
      : []),
    ...(isAuthenticated && user.isSupplier
      ? [{ path: "/supplier/profile", label: "My Profile" }]
      : []),
    ...(isAuthenticated && !user.isSupplier && user.role === "USER"
      ? [{ path: "/supplier/apply", label: "Apply as Supplier" }]
      : []),
  ];

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 border-r pr-4">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground">
                SupplierHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="pl-4 hidden md:flex items-center w-full">
            <div className="flex space-x-4">
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
            </div>
          </div>

          {/* Authentication Links */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="h-9 w-9 p-0"
              >
                {darkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {!isAuthenticated ? (
                <>
                  <Link to="/auth/login">
                    <Button variant="outline" size="sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Sign Out
                </Button>
              )}
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
              {darkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="h-9 w-9 p-0"
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
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
                {!isAuthenticated ? (
                  <>
                    <Link to="/auth/login" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth/register" className="flex-1">
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
