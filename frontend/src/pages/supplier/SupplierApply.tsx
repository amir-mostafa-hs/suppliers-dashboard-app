import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowLeft, 
  ArrowRight, 
  Upload, 
  File, 
  CheckCircle,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const businessDetailsSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "ZIP code must be at least 5 characters"),
});

type BusinessDetailsForm = z.infer<typeof businessDetailsSchema>;

const SupplierApply = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessDetails, setBusinessDetails] = useState<BusinessDetailsForm | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessDetailsForm>({
    resolver: zodResolver(businessDetailsSchema),
  });

  const progress = (currentStep / 2) * 100;

  const onBusinessDetailsSubmit = (data: BusinessDetailsForm) => {
    setBusinessDetails(data);
    setCurrentStep(2);
    toast({
      title: "Step 1 completed",
      description: "Business details saved successfully.",
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type === "application/pdf" || 
                         file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files",
        description: "Only PDF and image files under 10MB are allowed.",
        variant: "destructive",
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalSubmit = async () => {
    if (!businessDetails || uploadedFiles.length === 0) {
      toast({
        title: "Incomplete application",
        description: "Please complete all steps and upload at least one document.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Application submitted successfully!",
        description: "We'll review your application and get back to you within 2-3 business days.",
      });

      // Reset form or redirect
      setCurrentStep(1);
      setBusinessDetails(null);
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Supplier Application</h1>
        </div>
        <Badge variant="secondary">
          Step {currentStep} of 2
        </Badge>
      </div>
      <Progress value={progress} className="mb-2" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span className={currentStep >= 1 ? "text-primary font-medium" : ""}>
          Business Details
        </span>
        <span className={currentStep >= 2 ? "text-primary font-medium" : ""}>
          Document Upload
        </span>
      </div>
    </div>
  );

  const renderBusinessDetailsStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Business Information</CardTitle>
        <CardDescription>
          Tell us about your business to get started with the application process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onBusinessDetailsSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              {...register("businessName")}
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
              placeholder="Enter your business address"
              {...register("address")}
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
                placeholder="City"
                {...register("city")}
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
                placeholder="State"
                {...register("state")}
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
                placeholder="ZIP Code"
                {...register("zipCode")}
                className={errors.zipCode ? "border-destructive" : ""}
              />
              {errors.zipCode && (
                <p className="text-sm text-destructive">{errors.zipCode.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderDocumentUploadStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Document Upload</CardTitle>
        <CardDescription>
          Upload required business documents for verification. Accepted formats: PDF, JPG, PNG (max 10MB each).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="space-y-2">
            <h3 className="font-medium">Drop files here or click to upload</h3>
            <p className="text-sm text-muted-foreground">
              Business license, tax documents, certificates, etc.
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Choose Files
            </Button>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Uploaded Documents</h4>
            {uploadedFiles.map((file, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
              >
                <div className="flex items-center space-x-3">
                  <File className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <Button 
            onClick={handleFinalSubmit}
            disabled={uploadedFiles.length === 0 || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}
        
        {currentStep === 1 && renderBusinessDetailsStep()}
        {currentStep === 2 && renderDocumentUploadStep()}
      </div>
    </div>
  );
};

export default SupplierApply;