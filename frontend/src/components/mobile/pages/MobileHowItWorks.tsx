import { useState } from "react";
import { Search, UserCheck, Calendar, Camera, Star, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { MobileNavBar } from "../MobileNavBar";

interface MobileHowItWorksProps {
  onBack: () => void;
}

export function MobileHowItWorks({ onBack }: MobileHowItWorksProps) {
  const [activeTab, setActiveTab] = useState<"consumer" | "vendor">("consumer");

  const consumerSteps = [
    {
      icon: Search,
      title: "Search & Browse",
      description: "Find professionals by location, date, and service type. View portfolios and reviews.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: UserCheck,
      title: "View Profiles",
      description: "Check detailed profiles, portfolios, pricing, and customer reviews.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      title: "Request Booking",
      description: "Select your date, choose half-day or full-day, and send request.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Camera,
      title: "Service Delivery",
      description: "Professional accepts and delivers amazing service on your day.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Star,
      title: "Leave Review",
      description: "Rate your experience and help others make decisions.",
      color: "from-green-500 to-green-600",
    },
  ];

  const vendorSteps = [
    {
      icon: UserCheck,
      title: "Create Profile",
      description: "Sign up as a professional and complete your profile with portfolio.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Search,
      title: "Get Discovered",
      description: "Your profile appears in search results when clients look for services.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Calendar,
      title: "Receive Requests",
      description: "Get booking requests from clients and accept the best fit.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Camera,
      title: "Deliver Service",
      description: "Provide excellent service and capture memorable moments.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: TrendingUp,
      title: "Get Paid & Reviewed",
      description: "Receive payment and build reputation with positive reviews.",
      color: "from-green-500 to-green-600",
    },
  ];

  const steps = activeTab === "consumer" ? consumerSteps : vendorSteps;

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <MobileNavBar title="How It Works" onBack={onBack} />

      <div className="px-4 py-6">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Simple & Effective</span>
          </div>
          <p className="text-gray-600">
            Whether you're hiring or offering services,
            <br />
            we've made it simple
          </p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex bg-white/80 backdrop-blur-sm p-1 rounded-2xl mb-6 shadow-md">
          <button
            onClick={() => setActiveTab("consumer")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "consumer"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "text-gray-600"
            }`}
          >
            For Clients
          </button>
          <button
            onClick={() => setActiveTab("vendor")}
            className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
              activeTab === "vendor"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                : "text-gray-600"
            }`}
          >
            For Professionals
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Background Gradient */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${step.color} opacity-10 rounded-bl-full`} />
                
                <div className="relative z-10 flex gap-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0 relative`}>
                    <Icon className="w-7 h-7 text-white" />
                    
                    {/* Pulse Ring */}
                    <motion.div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-20`}
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0, 0.3],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-blue-600">Step {index + 1}</span>
                    </div>
                    <h3 className="font-bold text-base mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-10 bottom-0 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent translate-y-full" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-5 text-center shadow-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-sm text-gray-600 mb-1">Average booking time</div>
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Under 5 Minutes
          </div>
        </motion.div>
      </div>
    </div>
  );
}
