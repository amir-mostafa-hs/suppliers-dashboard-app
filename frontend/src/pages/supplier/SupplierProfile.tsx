import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/Loading";
import api from "@/lib/api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileText, AlertCircle } from "lucide-react";

const profileSchema = z.object({
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type ProfileForm = z.infer<typeof profileSchema>;

// Types for API responses
interface SupplierDocument {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileType: string;
}

interface SupplierProfileData {
  status: string;
  rejectionReason?: string;
  documents?: SupplierDocument[];
  profile?: {
    businessName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
}

const SupplierProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: userLoading, isError: userError } = useUser();
  const queryClient = useQueryClient();

  // Fetch supplier profile data
  const {
    data: supplierData,
    isLoading: profileLoading,
    isError: profileError,
  } = useQuery<SupplierProfileData>({
    queryKey: ["supplierProfile"],
    queryFn: async () => {
      const response = await api.get("/suppliers/profile");
      return response.data;
    },
    enabled: !!user && user.isSupplier,
  });

  // Mutation for updating profile
  const updateProfileMutation = useMutation({
    mutationFn: async (formData: ProfileForm) => {
      const response = await api.put("/suppliers/profile", formData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Profile updated successfully",
        description: "Your business profile has been saved.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["supplierProfile"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : "Something went wrong. Please try again.";

      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation for generating download links
  const generateLinkMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.get(`/suppliers/documents/${documentId}/link`);
      return response.data;
    },
    onSuccess: (data) => {
      // Open download link in new tab
      window.open(data.downloadUrl, "_blank");
    },
    onError: (error: unknown) => {
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response: { data: { message: string } } }).response
              ?.data?.message
          : "Failed to generate download link.";

      toast({
        title: "Download failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Update form when supplier data is loaded
  useEffect(() => {
    if (supplierData?.profile) {
      reset({
        businessName: supplierData.profile.businessName || "",
        address: supplierData.profile.address || "",
        city: supplierData.profile.city || "",
        state: supplierData.profile.state || "",
        zipCode: supplierData.profile.zipCode || "",
      });
    }
  }, [supplierData, reset]);

  // Redirect if user is not authenticated or not a supplier
  useEffect(() => {
    if (userError && !userLoading) {
      navigate("/auth/login");
    } else if (user && user.role === "ADMIN") {
      navigate("/admin/dashboard");
    } else if (user && !user.isSupplier) {
      navigate("/supplier/apply");
    }
  }, [user, userLoading, userError, navigate]);

  // If supplier profile doesn't exist, redirect to apply page
  useEffect(() => {
    if (profileError && !profileLoading && user?.isSupplier) {
      navigate("/supplier/apply");
    }
  }, [profileError, profileLoading, user, navigate]);

  if (userLoading || profileLoading) {
    return <Loading variant="page" />;
  }

  if (userError || !user) {
    navigate("/auth/login");
    return <Loading variant="page" />;
  }

  if (!user.isSupplier) {
    navigate("/supplier/apply");
    return <Loading variant="page" />;
  }

  const onSubmit = async (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Supplier Profile</h1>
              <p className="text-muted-foreground">
                Manage your business information and profile details.
              </p>
            </div>

            {supplierData?.status === "APPROVED" &&
              (!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    form="profile-form"
                    disabled={updateProfileMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Your business details and contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {supplierData?.status !== "APPROVED" && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {supplierData?.status === "PENDING"
                        ? "Your application is currently under review. You'll be able to edit your profile once it's approved."
                        : supplierData?.status === "REJECTED"
                        ? "Your application was rejected. Please check the rejection reason above and consider reapplying."
                        : "Please wait for your application to be processed."}
                    </p>
                  </div>
                )}

                <form
                  id="profile-form"
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...register("businessName")}
                      disabled={
                        !isEditing || supplierData?.status !== "APPROVED"
                      }
                      className={
                        errors.businessName ? "border-destructive" : ""
                      }
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive">
                        {errors.businessName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address *</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      disabled={
                        !isEditing || supplierData?.status !== "APPROVED"
                      }
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        {...register("city")}
                        disabled={!isEditing}
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        disabled={
                          !isEditing || supplierData?.status !== "APPROVED"
                        }
                        className={errors.state ? "border-destructive" : ""}
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        {...register("zipCode")}
                        disabled={
                          !isEditing || supplierData?.status !== "APPROVED"
                        }
                        className={errors.zipCode ? "border-destructive" : ""}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Status & Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Account Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    className={
                      supplierData?.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : supplierData?.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {supplierData?.status || "UNKNOWN"}
                  </Badge>
                </div>

                {supplierData?.status === "REJECTED" &&
                  supplierData?.rejectionReason && (
                    <>
                      <Separator />
                      <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-md">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-red-800">
                            Rejection Reason
                          </p>
                          <p className="text-sm text-red-700">
                            {supplierData.rejectionReason}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {supplierData?.documents && supplierData.documents.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Documents</span>
                  </CardTitle>
                  <CardDescription>
                    Your uploaded documents and files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supplierData.documents.map((document) => (
                      <div
                        key={document.id}
                        className="flex flex-col items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium truncate max-w-[150px]">
                              {document.fileName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {document.fileType}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="link"
                          onClick={() =>
                            generateLinkMutation.mutate(document.id)
                          }
                          disabled={generateLinkMutation.isPending}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Application Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Application Submitted</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documents Uploaded</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Under Review</span>
                    <span
                      className={
                        supplierData?.status === "PENDING"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {supplierData?.status === "PENDING" ? "..." : "✓"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Approved</span>
                    <span
                      className={
                        supplierData?.status === "APPROVED"
                          ? "text-green-600"
                          : supplierData?.status === "REJECTED"
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }
                    >
                      {supplierData?.status === "APPROVED"
                        ? "✓"
                        : supplierData?.status === "REJECTED"
                        ? "✗"
                        : "..."}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;
