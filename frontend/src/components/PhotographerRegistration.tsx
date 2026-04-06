import { useState } from "react";
import { motion } from "motion/react";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Camera, 
  Globe,
  FileText,
  CheckCircle2,
  Upload
} from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { showErrorAlert, showSuccessAlert } from "../lib/alerts";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";

interface PhotographerRegistrationProps {
  onBack: () => void;
}

export function PhotographerRegistration({ onBack }: PhotographerRegistrationProps) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Personal Details State
  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: ""
  });

  // Professional Details State
  const [professionalDetails, setProfessionalDetails] = useState({
    businessName: "",
    specialty: "",
    experience: "",
    bio: "",
    website: "",
    portfolio: "",
    services: "",
    languages: "",
    pricing: "",
    availability: ""
  });

  const handlePersonalChange = (field: string, value: string) => {
    setPersonalDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessionalChange = (field: string, value: string) => {
    setProfessionalDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleNextStep = async () => {
    // Basic validation for step 1
    if (step === 1) {
      if (!personalDetails.firstName || !personalDetails.lastName || !personalDetails.email || !personalDetails.phone) {
        await showErrorAlert("Registration failed", { text: "Please fill in all required fields." });
        return;
      }
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalDetails.email)) {
        await showErrorAlert("Registration failed", { text: "Please enter a valid email address." });
        return;
      }
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousStep = () => {
    setStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation for step 2
    if (!professionalDetails.businessName || !professionalDetails.specialty || !professionalDetails.bio) {
      await showErrorAlert("Registration failed", { text: "Please fill in all required fields." });
      return;
    }

    // Simulate submission
    setIsSubmitted(true);
    await showSuccessAlert("Registration submitted", { text: "Your registration was submitted successfully." });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Success Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] via-white to-[var(--blue-100)] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center p-12 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl mb-4 text-[var(--primary)]">
                Registration Successful!
              </h2>
              
              <p className="text-lg text-[var(--muted-foreground)] mb-8">
                Thank you for registering, <strong>{personalDetails.firstName}</strong>! We'll be in touch soon with early access details.
              </p>

              <div className="p-6 rounded-2xl bg-[var(--blue-50)] mb-8">
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  What happens next?
                </p>
                <ul className="text-left space-y-3 text-sm text-[var(--primary)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You'll receive a confirmation email at <strong>{personalDetails.email}</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Our team will review your application within 2-3 business days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>You'll get early access credentials before the official launch</span>
                  </li>
                </ul>
              </div>

              <motion.button
                onClick={onBack}
                className="px-8 py-3 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white rounded-xl hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] transition-all shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] via-white to-[var(--blue-100)] py-12">
      {/* Header */}
      <motion.div 
        className="container mx-auto px-4 sm:px-6 lg:px-8 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--blue-600)] hover:text-[var(--blue-700)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <img 
            src={logoImage} 
            alt="photorido" 
            className="h-8 w-auto object-contain"
          />
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>
      </motion.div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Progress Bar */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-[var(--blue-600)] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <p className="text-sm mt-2 text-[var(--muted-foreground)]">Personal Details</p>
              </div>
              <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-[var(--blue-600)]' : 'bg-gray-200'}`} />
              <div className="text-center flex-1">
                <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-[var(--blue-600)] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <p className="text-sm mt-2 text-[var(--muted-foreground)]">Professional Details</p>
              </div>
            </div>
          </motion.div>

          {/* Form Container */}
          <motion.div
            className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/60 shadow-2xl p-6 sm:p-8 lg:p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit}>
              {/* Step 1: Personal Details */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl mb-2 text-[var(--primary)]">Personal Details</h2>
                    <p className="text-[var(--muted-foreground)]">Tell us about yourself</p>
                  </div>

                  <div className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-[var(--blue-600)]" />
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          type="text"
                          value={personalDetails.firstName}
                          onChange={(e) => handlePersonalChange("firstName", e.target.value)}
                          placeholder="John"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-[var(--blue-600)]" />
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          type="text"
                          value={personalDetails.lastName}
                          onChange={(e) => handlePersonalChange("lastName", e.target.value)}
                          placeholder="Doe"
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-[var(--blue-600)]" />
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={personalDetails.email}
                          onChange={(e) => handlePersonalChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4 text-[var(--blue-600)]" />
                          Phone Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={personalDetails.phone}
                          onChange={(e) => handlePersonalChange("phone", e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                          className="h-12"
                        />
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="dateOfBirth" className="mb-2 block">
                          Date of Birth
                        </Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={personalDetails.dateOfBirth}
                          onChange={(e) => handlePersonalChange("dateOfBirth", e.target.value)}
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender" className="mb-2 block">
                          Gender
                        </Label>
                        <Select value={personalDetails.gender} onValueChange={(value) => handlePersonalChange("gender", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-[var(--blue-600)]" />
                        Street Address
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        value={personalDetails.address}
                        onChange={(e) => handlePersonalChange("address", e.target.value)}
                        placeholder="123 Main Street"
                        className="h-12"
                      />
                    </div>

                    {/* Location Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <Label htmlFor="city" className="mb-2 block">
                          City
                        </Label>
                        <Input
                          id="city"
                          type="text"
                          value={personalDetails.city}
                          onChange={(e) => handlePersonalChange("city", e.target.value)}
                          placeholder="Mumbai"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="mb-2 block">
                          State/Province
                        </Label>
                        <Input
                          id="state"
                          type="text"
                          value={personalDetails.state}
                          onChange={(e) => handlePersonalChange("state", e.target.value)}
                          placeholder="Maharashtra"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country" className="mb-2 block">
                          Country
                        </Label>
                        <Input
                          id="country"
                          type="text"
                          value={personalDetails.country}
                          onChange={(e) => handlePersonalChange("country", e.target.value)}
                          placeholder="India"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="postalCode" className="mb-2 block">
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          type="text"
                          value={personalDetails.postalCode}
                          onChange={(e) => handlePersonalChange("postalCode", e.target.value)}
                          placeholder="400001"
                          className="h-12"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-8">
                    <motion.button
                      type="button"
                      onClick={handleNextStep}
                      className="px-8 py-3 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white rounded-xl hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] transition-all shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next Step
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Professional Details */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-8">
                    <h2 className="text-3xl mb-2 text-[var(--primary)]">Professional Details</h2>
                    <p className="text-[var(--muted-foreground)]">Tell us about your photography business</p>
                  </div>

                  <div className="space-y-6">
                    {/* Business Name */}
                    <div>
                      <Label htmlFor="businessName" className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-[var(--blue-600)]" />
                        Business/Studio Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="businessName"
                        type="text"
                        value={professionalDetails.businessName}
                        onChange={(e) => handleProfessionalChange("businessName", e.target.value)}
                        placeholder="John Doe Photography"
                        required
                        className="h-12"
                      />
                    </div>

                    {/* Specialty and Experience */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="specialty" className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-[var(--blue-600)]" />
                          Photography Specialty <span className="text-red-500">*</span>
                        </Label>
                        <Select value={professionalDetails.specialty} onValueChange={(value) => handleProfessionalChange("specialty", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="wedding">Wedding Photography</SelectItem>
                            <SelectItem value="portrait">Portrait Photography</SelectItem>
                            <SelectItem value="event">Event Photography</SelectItem>
                            <SelectItem value="commercial">Commercial Photography</SelectItem>
                            <SelectItem value="fashion">Fashion Photography</SelectItem>
                            <SelectItem value="product">Product Photography</SelectItem>
                            <SelectItem value="landscape">Landscape Photography</SelectItem>
                            <SelectItem value="wildlife">Wildlife Photography</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="experience" className="mb-2 block">
                          Years of Experience
                        </Label>
                        <Select value={professionalDetails.experience} onValueChange={(value) => handleProfessionalChange("experience", value)}>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1">Less than 1 year</SelectItem>
                            <SelectItem value="1-3">1-3 years</SelectItem>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="5-10">5-10 years</SelectItem>
                            <SelectItem value="10+">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <Label htmlFor="bio" className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-[var(--blue-600)]" />
                        Professional Bio <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="bio"
                        value={professionalDetails.bio}
                        onChange={(e) => handleProfessionalChange("bio", e.target.value)}
                        placeholder="Tell clients about your photography style, experience, and what makes you unique..."
                        required
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    {/* Website and Portfolio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="website" className="flex items-center gap-2 mb-2">
                          <Globe className="w-4 h-4 text-[var(--blue-600)]" />
                          Website URL
                        </Label>
                        <Input
                          id="website"
                          type="url"
                          value={professionalDetails.website}
                          onChange={(e) => handleProfessionalChange("website", e.target.value)}
                          placeholder="https://www.yourwebsite.com"
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="portfolio" className="flex items-center gap-2 mb-2">
                          <Camera className="w-4 h-4 text-[var(--blue-600)]" />
                          Portfolio URL
                        </Label>
                        <Input
                          id="portfolio"
                          type="url"
                          value={professionalDetails.portfolio}
                          onChange={(e) => handleProfessionalChange("portfolio", e.target.value)}
                          placeholder="https://www.behance.net/yourportfolio"
                          className="h-12"
                        />
                      </div>
                    </div>

                    {/* Services */}
                    <div>
                      <Label htmlFor="services" className="mb-2 block">
                        Services Offered
                      </Label>
                      <Textarea
                        id="services"
                        value={professionalDetails.services}
                        onChange={(e) => handleProfessionalChange("services", e.target.value)}
                        placeholder="List the services you offer (e.g., Wedding Photography, Photo Editing, Print Packages, etc.)"
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* Languages and Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="languages" className="mb-2 block">
                          Languages Spoken
                        </Label>
                        <Input
                          id="languages"
                          type="text"
                          value={professionalDetails.languages}
                          onChange={(e) => handleProfessionalChange("languages", e.target.value)}
                          placeholder="English, Hindi, etc."
                          className="h-12"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pricing" className="mb-2 block">
                          Starting Price (₹)
                        </Label>
                        <Input
                          id="pricing"
                          type="text"
                          value={professionalDetails.pricing}
                          onChange={(e) => handleProfessionalChange("pricing", e.target.value)}
                          placeholder="₹25,000"
                          className="h-12"
                        />
                      </div>
                    </div>

                    {/* Availability */}
                    <div>
                      <Label htmlFor="availability" className="mb-2 block">
                        Availability
                      </Label>
                      <Select value={professionalDetails.availability} onValueChange={(value) => handleProfessionalChange("availability", value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available immediately</SelectItem>
                          <SelectItem value="limited">Limited availability</SelectItem>
                          <SelectItem value="booking">Taking bookings for future dates</SelectItem>
                          <SelectItem value="not-available">Not available currently</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex justify-between mt-8">
                    <motion.button
                      type="button"
                      onClick={handlePreviousStep}
                      className="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Previous
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="px-8 py-3 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white rounded-xl hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] transition-all shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Registration
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
