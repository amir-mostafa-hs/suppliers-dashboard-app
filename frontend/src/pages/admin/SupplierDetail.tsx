import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock supplier data
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
    notes: "Strong business history and excellent references. All documentation complete.",
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
  const [isProcessing, setIsProcessing] = useState(false);

  const supplier = id ? mockSupplierData[id as keyof typeof mockSupplierData] : null;

  if (!supplier) {
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

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Supplier approved",
        description: `${supplier.businessName} has been approved as a supplier.`,
      });
    } catch (error) {
      toast({
        title: "Approval failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Supplier rejected",
        description: `${supplier.businessName}'s application has been rejected.`,
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Rejection failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: { variant: "secondary" as const, icon: Clock, color: "text-warning" },
      APPROVED: { variant: "default" as const, icon: CheckCircle, color: "text-success" },
      REJECTED: { variant: "destructive" as const, icon: XCircle, color: "text-destructive" },
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <p className="text-muted-foreground">Supplier Application Review</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusBadge(supplier.status)}
              <span className="text-sm text-muted-foreground">
                Applied: {new Date(supplier.appliedAt).toLocaleDateString()}
              </span>
            </div>
            
            {supplier.status === "PENDING" && (
              <div className="flex space-x-2">
                <Button 
                  onClick={handleReject}
                  variant="destructive"
                  disabled={isProcessing}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Approve"}
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
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.phone}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Website</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={supplier.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {supplier.website}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Business Address</label>
                    <div className="flex items-start space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                      <div>
                        <div>{supplier.address}</div>
                        <div>{supplier.city}, {supplier.state} {supplier.zipCode}</div>
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
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatFileSize(doc.size)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
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
                  {getStatusBadge(supplier.status)}
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Applied: {new Date(supplier.appliedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {supplier.reviewedAt && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Reviewed: {new Date(supplier.reviewedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {supplier.reviewedBy && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>Reviewed by: {supplier.reviewedBy}</span>
                    </div>
                  )}
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
                    <span className="text-success">{supplier.documents.length} files</span>
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

            {/* Admin Notes */}
            {supplier.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Admin Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {supplier.notes}
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