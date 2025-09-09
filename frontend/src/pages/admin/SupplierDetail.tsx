import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "../../lib/api/axios";

interface SupplierDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  supplierProfileId: string;
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface SupplierProfile {
  id: string;
  supplierStatus: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  userId: string;
  documents: SupplierDocument[];
  user: User;
}

// Mock supplier data (fallback)
const mockSupplierData = {
  "2": {
    id: "2",
    email: "supplier1@company.com",
    businessName: "ABC Corp",
    address: "123 Business Street",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    phone: "+1 (555) 123-4567",
    website: "https://abccorp.com",
    status: "APPROVED" as const,
    appliedAt: "2024-01-10T10:00:00Z",
    reviewedAt: "2024-01-15T14:30:00Z",
    reviewedBy: "admin@supplierhub.com",
    documents: [
      {
        id: "doc1",
        name: "Business License.pdf",
        type: "application/pdf",
        size: 2456789,
        uploadedAt: "2024-01-10T10:15:00Z",
      },
      {
        id: "doc2",
        name: "Tax Certificate.pdf",
        type: "application/pdf",
        size: 1234567,
        uploadedAt: "2024-01-10T10:16:00Z",
      },
      {
        id: "doc3",
        name: "Insurance Policy.jpg",
        type: "image/jpeg",
        size: 987654,
        uploadedAt: "2024-01-10T10:17:00Z",
      },
    ],
    notes:
      "Strong business history and excellent references. All documentation complete.",
  },
  "3": {
    id: "3",
    email: "supplier2@business.com",
    businessName: "XYZ Ltd",
    address: "456 Commerce Ave",
    city: "Los Angeles",
    state: "CA",
    zipCode: "90210",
    phone: "+1 (555) 987-6543",
    website: "https://xyzltd.com",
    status: "PENDING" as const,
    appliedAt: "2024-01-18T09:30:00Z",
    reviewedAt: null,
    reviewedBy: null,
    documents: [
      {
        id: "doc4",
        name: "Business Registration.pdf",
        type: "application/pdf",
        size: 1876543,
        uploadedAt: "2024-01-18T09:45:00Z",
      },
      {
        id: "doc5",
        name: "Financial Statement.pdf",
        type: "application/pdf",
        size: 3456789,
        uploadedAt: "2024-01-18T09:46:00Z",
      },
    ],
    notes: null,
  },
};

const SupplierDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  // Fetch supplier details
  const {
    data: supplier,
    isLoading,
    error,
  } = useQuery<SupplierProfile>({
    queryKey: ["supplier-detail", id],
    queryFn: async () => {
      const response = await api.get(`/admin/suppliers/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Approve supplier mutation
  const approveMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patch(`/admin/suppliers/${id}/approve`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Supplier approved",
        description: `${supplier?.businessName} has been approved as a supplier.`,
      });
    },
    onError: () => {
      toast({
        title: "Approval failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Reject supplier mutation
  const rejectMutation = useMutation({
    mutationFn: async (reason: string) => {
      const response = await api.patch(`/admin/suppliers/${id}/reject`, {
        rejectionReason: reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplier-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({
        title: "Supplier rejected",
        description: `${supplier?.businessName}'s application has been rejected.`,
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Rejection failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Loading...</h1>
          <p className="text-muted-foreground">Fetching supplier details</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Supplier Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The supplier you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/admin/dashboard">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    approveMutation.mutate();
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting this application.",
        variant: "destructive",
      });
      return;
    }

    rejectMutation.mutate(rejectionReason.trim());
    setIsRejectDialogOpen(false);
    setRejectionReason("");
  };

  const handleRejectCancel = () => {
    setIsRejectDialogOpen(false);
    setRejectionReason("");
  };

  const handleDownloadDocument = async (
    documentId: string,
    fileName: string
  ) => {
    try {
      const response = await api.get(
        `/admin/suppliers/${id}/documents/${documentId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-warning",
      },
      APPROVED: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-success",
      },
      REJECTED: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-destructive",
      },
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{supplier.businessName}</h1>
              <p className="text-muted-foreground">
                Supplier Application Review
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusBadge(supplier.supplierStatus)}
              <span className="text-sm text-muted-foreground">
                Status: {supplier.supplierStatus}
              </span>
            </div>

            {supplier.supplierStatus === "PENDING" && (
              <div className="flex space-x-2">
                <Dialog
                  open={isRejectDialogOpen}
                  onOpenChange={setIsRejectDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleRejectClick}
                      variant="destructive"
                      disabled={rejectMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {rejectMutation.isPending ? "Processing..." : "Reject"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reject Supplier Application</DialogTitle>
                      <DialogDescription>
                        Please provide a reason for rejecting{" "}
                        {supplier.businessName}'s application. This will be
                        shared with the supplier.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="rejection-reason">
                          Rejection Reason
                        </Label>
                        <Textarea
                          id="rejection-reason"
                          placeholder="Please explain why this application is being rejected..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={4}
                          className="mt-2"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={handleRejectCancel}
                          disabled={rejectMutation.isPending}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleRejectConfirm}
                          disabled={
                            rejectMutation.isPending || !rejectionReason.trim()
                          }
                        >
                          {rejectMutation.isPending
                            ? "Rejecting..."
                            : "Confirm Rejection"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approveMutation.isPending ? "Processing..." : "Approve"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Business Information</span>
                </CardTitle>
                <CardDescription>
                  Contact details and business address
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.user.email}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Phone
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>Not available</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Website
                      </label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>Not available</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Business Address
                    </label>
                    <div className="flex items-start space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <div>{supplier.address}</div>
                        <div>
                          {supplier.city}, {supplier.state} {supplier.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Uploaded Documents</span>
                </CardTitle>
                <CardDescription>
                  Business documents submitted with the application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {supplier.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.fileType}
                          </p>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDownloadDocument(doc.id, doc.fileName)
                          }
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Status:</span>
                  {getStatusBadge(supplier.supplierStatus)}
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Application ID: {supplier.id.slice(0, 8)}...</span>
                  </div>

                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>User: {supplier.user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Business Details</span>
                    <span className="text-success">Complete</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Documents Uploaded</span>
                    <span className="text-success">
                      {supplier.documents.length} files
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact Information</span>
                    <span className="text-success">Complete</span>
                  </div>

                  <Separator />

                  <div className="text-center text-sm font-medium">
                    Application Complete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rejection Reason */}
            {supplier.rejectionReason && (
              <Card>
                <CardHeader>
                  <CardTitle>Rejection Reason</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {supplier.rejectionReason}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;
