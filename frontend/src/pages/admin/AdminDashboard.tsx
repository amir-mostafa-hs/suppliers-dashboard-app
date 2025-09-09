import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api/axios";
import Loading from "@/components/Loading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Eye,
  Users,
  Building2,
  Clock,
  CheckCircle,
  ArrowUpDown,
} from "lucide-react";

// Types for API responses
interface SupplierProfile {
  id: string;
  supplierStatus: string;
  businessName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  rejectionReason?: string;
  documents?: Array<{
    id: string;
    fileName: string;
    fileType: string;
  }>;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "USER" | "SUPPLIER" | "ADMIN";
  isSupplier: boolean;
  createdAt: string;
  supplierProfile?: SupplierProfile;
  [key: string]: unknown;
}

// Mock user data (fallback)
const mockUsers = [
  {
    id: "1",
    email: "john.doe@example.com",
    role: "USER" as const,
    supplierStatus: null,
    createdAt: "2024-01-15",
    lastLogin: "2024-01-20",
  },
  {
    id: "2",
    email: "supplier1@company.com",
    role: "SUPPLIER" as const,
    supplierStatus: "APPROVED" as const,
    createdAt: "2024-01-10",
    lastLogin: "2024-01-19",
    businessName: "ABC Corp",
  },
  {
    id: "3",
    email: "supplier2@business.com",
    role: "SUPPLIER" as const,
    supplierStatus: "PENDING" as const,
    createdAt: "2024-01-18",
    lastLogin: "2024-01-18",
    businessName: "XYZ Ltd",
  },
  {
    id: "4",
    email: "supplier3@enterprise.com",
    role: "SUPPLIER" as const,
    supplierStatus: "REJECTED" as const,
    createdAt: "2024-01-12",
    lastLogin: "2024-01-17",
    businessName: "Tech Solutions Inc",
  },
  {
    id: "5",
    email: "admin@supplierhub.com",
    role: "ADMIN" as const,
    supplierStatus: null,
    createdAt: "2024-01-01",
    lastLogin: "2024-01-20",
  },
];

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const queryClient = useQueryClient();

  // Fetch users from API
  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey: ["adminUsers", searchTerm, roleFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();

      if (roleFilter !== "ALL") {
        params.append("role", roleFilter);
      }

      if (statusFilter !== "ALL" && statusFilter !== "NO_STATUS") {
        params.append("status", statusFilter);
      }

      if (searchTerm) {
        params.append("email", searchTerm);
      }

      const response = await api.get(`/admin/users?${params.toString()}`);
      return response.data;
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  // Filter and sort users (client-side filtering for additional filters)
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.supplierProfile?.businessName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ??
          false);

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "NO_STATUS" &&
          !user.supplierProfile?.supplierStatus) ||
        user.supplierProfile?.supplierStatus === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;

      if (sortField === "businessName") {
        aValue = a.supplierProfile?.businessName || "";
        bValue = b.supplierProfile?.businessName || "";
      } else if (sortField === "supplierStatus") {
        aValue = a.supplierProfile?.supplierStatus || "";
        bValue = b.supplierProfile?.supplierStatus || "";
      } else {
        aValue = a[sortField] || "";
        bValue = b[sortField] || "";
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      USER: "secondary",
      SUPPLIER: "default",
      ADMIN: "destructive",
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants]}>{role}</Badge>
    );
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">-</Badge>;

    const variants = {
      PENDING: { variant: "secondary" as const, icon: Clock },
      APPROVED: { variant: "default" as const, icon: CheckCircle },
      REJECTED: { variant: "destructive" as const, icon: null },
    };

    const config = variants[status as keyof typeof variants];
    const Icon = config?.icon;

    return (
      <Badge
        variant={config?.variant || "outline"}
        className="flex items-center gap-1"
      >
        {Icon && <Icon className="h-3 w-3" />}
        {status}
      </Badge>
    );
  };

  const stats = {
    totalUsers: users.length,
    suppliers: users.filter((u) => u.isSupplier).length,
    pendingApplications: users.filter(
      (u) => u.supplierProfile?.supplierStatus === "PENDING"
    ).length,
    approvedSuppliers: users.filter(
      (u) => u.supplierProfile?.supplierStatus === "APPROVED"
    ).length,
  };

  if (isLoading) {
    return <Loading variant="page" />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Error Loading Data</h1>
          <p className="text-muted-foreground">
            Failed to load users data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, suppliers, and applications across the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Users
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Suppliers
                </CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.suppliers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending Applications
                </CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                {stats.pendingApplications}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Approved Suppliers
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-success" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {stats.approvedSuppliers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Users & Suppliers</CardTitle>
                <CardDescription>
                  Manage all users and supplier applications
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Roles</SelectItem>
                    <SelectItem value="USER">Users</SelectItem>
                    <SelectItem value="SUPPLIER">Suppliers</SelectItem>
                    <SelectItem value="ADMIN">Admins</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Status</SelectItem>
                    <SelectItem value="NO_STATUS">No Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Email</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Business Name</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("role")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Role</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Supplier Status</TableHead>
                    <TableHead
                      className="cursor-pointer hover:text-foreground"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Created</span>
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.supplierProfile?.businessName || "-"}
                      </TableCell>
                      <TableCell>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRoleMutation.mutate({
                              userId: user.id,
                              role: e.target.value,
                            })
                          }
                          disabled={updateUserRoleMutation.isPending}
                          className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="USER">USER</option>
                          <option value="SUPPLIER">SUPPLIER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(
                          user.supplierProfile?.supplierStatus || null
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.isSupplier && user.supplierProfile ? (
                          <Link
                            to={`/admin/suppliers/${user.supplierProfile.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No users found matching your criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
