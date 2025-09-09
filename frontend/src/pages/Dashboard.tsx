import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/Loading";
import { useEffect } from "react";
import api from "../lib/api/axios";

interface User {
  id: string;
  email: string;
  role: string;
  isSupplier: boolean;
  supplierProfile?: {
    supplierStatus: "PENDING" | "APPROVED" | "REJECTED";
    businessName: string;
  };
}

const Dashboard = () => {
  const { user, supplierStatus, isLoading, isError } = useUser();
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<User[]>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get("/admin/users");
      return response.data;
    },
    enabled: user?.role === "ADMIN",
  });

  useEffect(() => {
    if (isError && !isLoading) {
      navigate("/auth/login");
    }
  }, [isError, isLoading, navigate]);

  // Redirect supplier users directly to their profile page
  useEffect(() => {
    if (user?.isSupplier && !isLoading) {
      navigate("/supplier/profile");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <Loading variant="page" />;
  }

  if (isError || !user) {
    navigate("/auth/login");
    return <Loading variant="page" />;
  }

  const { role } = user;

  const renderUserDashboard = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SupplierHub</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our network of trusted suppliers and grow your business with us.
          Get access to new opportunities and streamlined operations.
        </p>
        <Link to="/supplier/apply">
          <Button size="lg" className="text-lg px-8 py-6">
            Apply to Become a Supplier
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card>
          <CardHeader className="text-center">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Easy Application</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Simple multi-step application process with document upload and
              business verification.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Grow Your Business</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Access new markets and opportunities to expand your reach and
              increase revenue.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle>Trusted Network</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-center">
              Join a community of verified suppliers with dedicated support and
              resources.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const calculateStats = () => {
    if (!dashboardStats)
      return { totalUsers: 0, activeSuppliers: 0, pendingApplications: 0 };

    const totalUsers = dashboardStats.length;
    const activeSuppliers = dashboardStats.filter(
      (user) => user.supplierProfile?.supplierStatus === "APPROVED"
    ).length;
    const pendingApplications = dashboardStats.filter(
      (user) => user.supplierProfile?.supplierStatus === "PENDING"
    ).length;

    return { totalUsers, activeSuppliers, pendingApplications };
  };

  const getRecentActivities = () => {
    if (!dashboardStats) return [];

    const activities = [];

    // Get recent approved suppliers
    const recentApproved = dashboardStats
      .filter((user) => user.supplierProfile?.supplierStatus === "APPROVED")
      .slice(0, 2)
      .map((user) => ({
        id: user.id,
        type: "approval" as const,
        message: `Supplier "${
          user.supplierProfile?.businessName || user.email
        }" application approved`,
        timestamp: "Recently",
      }));

    // Get recent pending applications
    const recentPending = dashboardStats
      .filter((user) => user.supplierProfile?.supplierStatus === "PENDING")
      .slice(0, 2)
      .map((user) => ({
        id: user.id,
        type: "application" as const,
        message: `New supplier application from "${
          user.supplierProfile?.businessName || user.email
        }"`,
        timestamp: "Recently",
      }));

    // Get recent user registrations (users without supplier profile)
    const recentUsers = dashboardStats
      .filter((user) => !user.supplierProfile && user.role === "USER")
      .slice(0, 1)
      .map((user) => ({
        id: user.id,
        type: "registration" as const,
        message: `New user registration: ${user.email}`,
        timestamp: "Recently",
      }));

    activities.push(...recentApproved, ...recentPending, ...recentUsers);
    return activities.slice(0, 5);
  };

  const renderAdminDashboard = () => {
    const stats = calculateStats();
    const activities = getRecentActivities();

    if (statsLoading) {
      return <Loading variant="page" />;
    }

    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link to="/admin/dashboard">
            <Button>Manage Users & Suppliers</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Total Users</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Active Suppliers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.activeSuppliers}</div>
              <p className="text-muted-foreground">Approved suppliers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Pending Applications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.pendingApplications}
              </div>
              <p className="text-amber-600">Needs review</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50"
                  >
                    {activity.type === "approval" && (
                      <CheckCircle className="h-5 w-5 text-success" />
                    )}
                    {activity.type === "application" && (
                      <FileText className="h-5 w-5 text-primary" />
                    )}
                    {activity.type === "registration" && (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                    <span className="flex-1">{activity.message}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {activity.timestamp}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Redirect SUPPLIER users directly to their profile page
  if (user?.role === "SUPPLIER") {
    navigate("/supplier/profile");
    return <Loading variant="page" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === "USER" && renderUserDashboard()}
        {role === "ADMIN" && renderAdminDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;
