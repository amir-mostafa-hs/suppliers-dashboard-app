import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  X
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  website: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof profileSchema>;

// Mock supplier data
const mockSupplier = {
  id: "supplier-123",
  businessName: "ABC Corp",
  email: "contact@abccorp.com",
  address: "123 Business Street",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  phone: "+1 (555) 123-4567",
  website: "https://abccorp.com",
  status: "APPROVED" as const,
  appliedAt: "2024-01-10",
  approvedAt: "2024-01-15",
};

const SupplierProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: mockSupplier.businessName,
      address: mockSupplier.address,
      city: mockSupplier.city,
      state: mockSupplier.state,
      zipCode: mockSupplier.zipCode,
      phone: mockSupplier.phone,
      website: mockSupplier.website,
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Profile updated successfully",
        description: "Your business profile has been saved.",
      });
      
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
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
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button type="submit" form="profile-form" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
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
                <form id="profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      {...register("businessName")}
                      disabled={!isEditing}
                      className={errors.businessName ? "border-destructive" : ""}
                    />
                    {errors.businessName && (
                      <p className="text-sm text-destructive">{errors.businessName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Business Address *</Label>
                    <Input
                      id="address"
                      {...register("address")}
                      disabled={!isEditing}
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive">{errors.address.message}</p>
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
                        <p className="text-sm text-destructive">{errors.city.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        {...register("state")}
                        disabled={!isEditing}
                        className={errors.state ? "border-destructive" : ""}
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive">{errors.state.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code *</Label>
                      <Input
                        id="zipCode"
                        {...register("zipCode")}
                        disabled={!isEditing}
                        className={errors.zipCode ? "border-destructive" : ""}
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive">{errors.zipCode.message}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        disabled={!isEditing}
                        className={errors.phone ? "border-destructive" : ""}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website URL</Label>
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://yourwebsite.com"
                        {...register("website")}
                        disabled={!isEditing}
                        className={errors.website ? "border-destructive" : ""}
                      />
                      {errors.website && (
                        <p className="text-sm text-destructive">{errors.website.message}</p>
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
                  <Badge className="bg-success text-success-foreground">
                    {mockSupplier.status}
                  </Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{mockSupplier.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Applied: {new Date(mockSupplier.appliedAt).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Approved: {new Date(mockSupplier.approvedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Business Details</span>
                    <span className="text-success">Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contact Information</span>
                    <span className="text-success">Complete</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentation</span>
                    <span className="text-success">Verified</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center text-sm text-success font-medium">
                    Profile 100% Complete
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