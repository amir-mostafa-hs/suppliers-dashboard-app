import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Users, 
  TrendingUp,
  ArrowRight 
} from "lucide-react";

// Mock user data - in real app, this would come from authentication context
const mockUser: {
  role: "USER" | "SUPPLIER" | "ADMIN";
  supplierStatus: "PENDING" | "APPROVED" | "REJECTED";
  name: string;
  email: string;
} = {
  role: "USER", // Change to "SUPPLIER" or "ADMIN" to test different views
  supplierStatus: "PENDING", // PENDING, APPROVED, REJECTED
  name: "John Doe",
  email: "john@example.com",
};

const Dashboard = () => {
  const { role, supplierStatus } = mockUser;

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
              Simple multi-step application process with document upload and business verification.
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
              Access new markets and opportunities to expand your reach and increase revenue.
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
              Join a community of verified suppliers with dedicated support and resources.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSupplierDashboard = () => {
    const statusConfig = {
      PENDING: {
        icon: Clock,
        color: "text-warning",
        bgColor: "bg-warning/10",
        title: "Application Under Review",
        description: "We're reviewing your supplier application. This typically takes 2-3 business days.",
      },
      APPROVED: {
        icon: CheckCircle,
        color: "text-success",
        bgColor: "bg-success/10",
        title: "Welcome, Approved Supplier!",
        description: "Your application has been approved. You can now manage your profile and access supplier features.",
      },
      REJECTED: {
        icon: XCircle,
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        title: "Application Needs Attention",
        description: "Your application requires additional information. Please review and resubmit.",
      },
    };

    const config = statusConfig[supplierStatus];
    const StatusIcon = config.icon;

    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Supplier Dashboard</h1>
        
        <Card className={config.bgColor}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <StatusIcon className={`h-8 w-8 ${config.color}`} />
              <div>
                <CardTitle className="text-xl">{config.title}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  Status: {supplierStatus}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{config.description}</p>
            
            {supplierStatus === "APPROVED" && (
              <Link to="/supplier/profile">
                <Button>Manage Profile</Button>
              </Link>
            )}
            
            {supplierStatus === "REJECTED" && (
              <Link to="/supplier/apply">
                <Button>Reapply</Button>
              </Link>
            )}
          </CardContent>
        </Card>

        {supplierStatus === "APPROVED" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Active Contracts</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">12</div>
                <p className="text-muted-foreground">Ongoing partnerships</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Revenue This Month</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$45,230</div>
                <p className="text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Client Satisfaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.8</div>
                <p className="text-muted-foreground">Average rating</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link to="/admin/dashboard">
          <Button>Manage Users & Suppliers</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Total Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,234</div>
            <p className="text-muted-foreground">+15 this week</p>
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
            <div className="text-3xl font-bold">89</div>
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
            <div className="text-3xl font-bold">23</div>
            <p className="text-muted-foreground text-warning">Needs review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Monthly Growth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+18%</div>
            <p className="text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Supplier "ABC Corp" application approved</span>
              <Badge variant="secondary" className="ml-auto">2 hours ago</Badge>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <FileText className="h-5 w-5 text-primary" />
              <span>New supplier application from "XYZ Ltd"</span>
              <Badge variant="secondary" className="ml-auto">5 hours ago</Badge>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-primary" />
              <span>12 new user registrations today</span>
              <Badge variant="secondary" className="ml-auto">1 day ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {role === "USER" && renderUserDashboard()}
        {role === "SUPPLIER" && renderSupplierDashboard()}
        {role === "ADMIN" && renderAdminDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;