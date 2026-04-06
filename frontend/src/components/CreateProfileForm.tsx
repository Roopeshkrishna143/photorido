import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Camera, Upload, X, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { showErrorAlert, showSuccessAlert } from "../lib/alerts";

interface FormData {
  name: string;
  location: string;
  specialty: string;
  bio: string;
  experience: string;
  price: string;
  languages: string[];
  services: string[];
  profileImage: string;
  portfolioImages: string[];
}

const AVAILABLE_LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese",
  "Mandarin", "Japanese", "Korean", "Arabic", "Hindi", "Russian"
];

const AVAILABLE_SERVICES = [
  "Wedding Photography",
  "Portrait Photography",
  "Event Photography",
  "Commercial Photography",
  "Fashion Photography",
  "Product Photography",
  "Engagement Sessions",
  "Photo Editing",
  "Digital Albums",
  "Print Packages",
  "Drone Photography",
  "Video Production"
];

const SPECIALTIES = [
  "Wedding Photography",
  "Portrait Photography",
  "Event Photography",
  "Commercial Photography",
  "Fashion Photography",
  "Fine Art Photography",
  "Street Photography",
  "Newborn Photography",
  "Product Photography",
  "Landscape Photography"
];

export function CreateProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    specialty: "",
    bio: "",
    experience: "",
    price: "",
    languages: [],
    services: [],
    profileImage: "",
    portfolioImages: []
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [portfolioPreview, setPortfolioPreview] = useState<string[]>([]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a server and get a URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, profileImage: imageUrl }));
      void showSuccessAlert("Profile image uploaded", { toast: true });
    }
  };

  const handlePortfolioImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: string[] = [];
      Array.from(files).forEach(file => {
        const imageUrl = URL.createObjectURL(file);
        newImages.push(imageUrl);
      });
      
      setPortfolioPreview(prev => [...prev, ...newImages]);
      setFormData(prev => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...newImages]
      }));
      void showSuccessAlert(`${files.length} portfolio image(s) uploaded`, { toast: true });
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioPreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      portfolioImages: prev.portfolioImages.filter((_, i) => i !== index)
    }));
    void showSuccessAlert("Portfolio image removed", { toast: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.location || !formData.specialty || !formData.bio) {
      await showErrorAlert("Profile creation failed", { text: "Please fill in all required fields." });
      return;
    }

    if (formData.languages.length === 0) {
      await showErrorAlert("Profile creation failed", { text: "Please select at least one language." });
      return;
    }

    if (formData.services.length === 0) {
      await showErrorAlert("Profile creation failed", { text: "Please select at least one service." });
      return;
    }

    // In a real app, you would send this to a server
    console.log("Form submitted:", formData);
    await showSuccessAlert("Profile created", { text: "Your profile was created successfully." });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--blue-50)] to-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl mb-4 text-[var(--primary)]">Create Your Profile</h1>
            <p className="text-lg text-[var(--muted-foreground)]">
              Join our community of creative professionals
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-100)] shadow-xl">
              <h2 className="text-2xl mb-6 text-[var(--primary)]">Basic Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Emma Rodriguez"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base">
                      Location <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="location"
                      placeholder="New York, USA"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      className="h-12 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-base">
                      Specialty <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.specialty}
                      onValueChange={(value) => handleInputChange("specialty", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPECIALTIES.map((specialty) => (
                          <SelectItem key={specialty} value={specialty}>
                            {specialty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience" className="text-base">
                      Experience <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange("experience", value)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-2 Years">1-2 Years</SelectItem>
                        <SelectItem value="3-5 Years">3-5 Years</SelectItem>
                        <SelectItem value="5-8 Years">5-8 Years</SelectItem>
                        <SelectItem value="8+ Years">8+ Years</SelectItem>
                        <SelectItem value="10+ Years">10+ Years</SelectItem>
                        <SelectItem value="15+ Years">15+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-base">
                    Starting Price (per session) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                      ₹
                    </span>
                    <Input
                      id="price"
                      type="number"
                      placeholder="35000"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="h-12 rounded-xl pl-8"
                      required
                    />
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Set your base rate in Indian Rupees (₹)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-base">
                    Bio / About Me <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your photography style, and what makes you unique..."
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="min-h-[150px] rounded-xl resize-none"
                    required
                  />
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {formData.bio.length} characters
                  </p>
                </div>
              </div>
            </Card>

            {/* Profile Image Upload - This section will be completed in the next TODO */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-100)] shadow-xl">
              <h2 className="text-2xl mb-6 text-[var(--primary)]">Profile Image</h2>
              
              <div className="space-y-4">
                <p className="text-[var(--muted-foreground)]">
                  Upload a professional profile photo (recommended: 800x800px)
                </p>
                
                <div className="flex flex-col items-center gap-4">
                  {profileImagePreview ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <ImageWithFallback
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-48 h-48 rounded-full object-cover border-4 border-[var(--blue-200)] shadow-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 rounded-full shadow-lg"
                        onClick={() => {
                          setProfileImagePreview("");
                          setFormData(prev => ({ ...prev, profileImage: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <label
                      htmlFor="profileImage"
                      className="flex flex-col items-center justify-center w-48 h-48 rounded-full border-2 border-dashed border-[var(--blue-300)] bg-[var(--blue-50)] cursor-pointer hover:bg-[var(--blue-100)] transition-colors"
                    >
                      <Upload className="h-12 w-12 text-[var(--blue-600)] mb-2" />
                      <span className="text-sm text-[var(--blue-700)]">Upload Photo</span>
                    </label>
                  )}
                  
                  <input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                  
                  {!profileImagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("profileImage")?.click()}
                      className="rounded-xl"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Save and continue to next section */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-100)] shadow-xl">
              <h2 className="text-2xl mb-6 text-[var(--primary)]">Portfolio Images</h2>
              
              <div className="space-y-4">
                <p className="text-[var(--muted-foreground)]">
                  Upload your best work to showcase your skills (minimum 3 images recommended)
                </p>
                
                <div className="space-y-4">
                  {/* Upload Button */}
                  <div className="flex justify-center">
                    <label htmlFor="portfolioImages">
                      <div className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-xl border-2 border-[var(--blue-300)] hover:bg-[var(--blue-50)] hover:border-[var(--blue-500)]"
                          onClick={() => document.getElementById("portfolioImages")?.click()}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Portfolio Images
                        </Button>
                      </div>
                    </label>
                    <input
                      id="portfolioImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePortfolioImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Portfolio Grid */}
                  {portfolioPreview.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                    >
                      <AnimatePresence>
                        {portfolioPreview.map((image, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            className="relative aspect-square group"
                          >
                            <ImageWithFallback
                              src={image}
                              alt={`Portfolio ${index + 1}`}
                              className="w-full h-full object-cover rounded-2xl border-2 border-[var(--blue-100)] shadow-md"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removePortfolioImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {portfolioPreview.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[var(--blue-200)] rounded-2xl bg-[var(--blue-50)]">
                      <Camera className="h-16 w-16 text-[var(--blue-400)] mb-4" />
                      <p className="text-[var(--muted-foreground)] mb-2">No portfolio images yet</p>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Click the button above to add your work
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-100)] shadow-xl">
              <h2 className="text-2xl mb-6 text-[var(--primary)]">
                Languages <span className="text-red-500">*</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-[var(--muted-foreground)]">
                  Select all languages you can communicate in
                </p>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <motion.div
                      key={language}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <label
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                          formData.languages.includes(language)
                            ? "border-[var(--blue-500)] bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white shadow-lg"
                            : "border-[var(--border)] bg-white hover:border-[var(--blue-300)] hover:bg-[var(--blue-50)]"
                        }`}
                      >
                        <Checkbox
                          checked={formData.languages.includes(language)}
                          onCheckedChange={() => handleLanguageToggle(language)}
                          className={`h-5 w-5 ${
                            formData.languages.includes(language) ? "border-white" : ""
                          }`}
                        />
                        <span className="text-sm">{language}</span>
                      </label>
                    </motion.div>
                  ))}
                </div>

                {formData.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-200)]">
                    <span className="text-sm text-[var(--muted-foreground)]">Selected Languages:</span>
                    {formData.languages.map((language) => (
                      <Badge
                        key={language}
                        variant="outline"
                        className="border-[var(--blue-400)] text-[var(--blue-700)]"
                      >
                        {language}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Services Offered */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-100)] shadow-xl">
              <h2 className="text-2xl mb-6 text-[var(--primary)]">
                Services Offered <span className="text-red-500">*</span>
              </h2>
              
              <div className="space-y-4">
                <p className="text-[var(--muted-foreground)]">
                  Select all services you provide to your clients
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {AVAILABLE_SERVICES.map((service) => (
                    <motion.div
                      key={service}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <label
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.services.includes(service)
                            ? "border-[var(--blue-500)] bg-gradient-to-r from-[var(--blue-50)] to-[var(--blue-100)] shadow-md"
                            : "border-[var(--border)] bg-white hover:border-[var(--blue-300)] hover:bg-[var(--blue-50)]"
                        }`}
                      >
                        <Checkbox
                          checked={formData.services.includes(service)}
                          onCheckedChange={() => handleServiceToggle(service)}
                          className="h-5 w-5"
                        />
                        <span className={formData.services.includes(service) ? "text-[var(--blue-700)]" : ""}>
                          {service}
                        </span>
                        {formData.services.includes(service) && (
                          <CheckCircle2 className="h-5 w-5 text-[var(--blue-600)] ml-auto" />
                        )}
                      </label>
                    </motion.div>
                  ))}
                </div>

                {formData.services.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-[var(--blue-50)] rounded-xl border border-[var(--blue-200)]">
                    <span className="text-sm text-[var(--muted-foreground)]">Selected:</span>
                    {formData.services.map((service) => (
                      <Badge
                        key={service}
                        className="bg-[var(--blue-600)] hover:bg-[var(--blue-700)] text-white"
                      >
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Submit Button */}
            <Card className="p-8 rounded-3xl border-2 border-[var(--blue-200)] bg-gradient-to-br from-white to-[var(--blue-50)] shadow-xl">
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-2xl mb-2 text-[var(--primary)]">Ready to Join?</h2>
                  <p className="text-[var(--muted-foreground)]">
                    Submit your profile to start connecting with clients worldwide
                  </p>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    className="h-14 px-12 text-lg bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] shadow-xl hover:shadow-2xl transition-all rounded-xl"
                  >
                    Create Profile
                  </Button>
                </motion.div>

                <p className="text-sm text-[var(--muted-foreground)]">
                  By creating a profile, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </Card>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
