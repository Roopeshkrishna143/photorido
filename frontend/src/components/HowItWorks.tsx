import { Search, UserCheck, Calendar, Star, Camera, TrendingUp, ArrowRight, Sparkles, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface HowItWorksProps {
  compact?: boolean;
}

export function HowItWorks({ compact = false }: HowItWorksProps) {
  const consumerSteps = [
    {
      icon: Search,
      title: "Search & Browse",
      description: "Find professionals by location, date, and service type. View portfolios and reviews.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      accentColor: "text-blue-600",
      lightColor: "bg-blue-100",
      gradient: "from-blue-400/20 to-blue-600/20",
    },
    {
      icon: UserCheck,
      title: "View Profiles",
      description: "Check detailed profiles, portfolios, pricing, and customer reviews to make your choice.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      accentColor: "text-purple-600",
      lightColor: "bg-purple-100",
      gradient: "from-purple-400/20 to-purple-600/20",
    },
    {
      icon: Calendar,
      title: "Request Booking",
      description: "Select your preferred date, choose half-day or full-day, and send a booking request.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      accentColor: "text-pink-600",
      lightColor: "bg-pink-100",
      gradient: "from-pink-400/20 to-pink-600/20",
    },
    {
      icon: Camera,
      title: "Service Delivery",
      description: "Professional accepts your request, delivers amazing service on your special day.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      accentColor: "text-orange-600",
      lightColor: "bg-orange-100",
      gradient: "from-orange-400/20 to-orange-600/20",
    },
    {
      icon: Star,
      title: "Leave Review",
      description: "Rate your experience and help others make informed decisions.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      accentColor: "text-green-600",
      lightColor: "bg-green-100",
      gradient: "from-green-400/20 to-green-600/20",
    },
  ];

  const vendorSteps = [
    {
      icon: UserCheck,
      title: "Create Profile",
      description: "Sign up as a professional and complete your profile with portfolio and services.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      accentColor: "text-blue-600",
      lightColor: "bg-blue-100",
      gradient: "from-blue-400/20 to-blue-600/20",
    },
    {
      icon: Search,
      title: "Get Discovered",
      description: "Your profile appears in search results when clients look for your services.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      accentColor: "text-purple-600",
      lightColor: "bg-purple-100",
      gradient: "from-purple-400/20 to-purple-600/20",
    },
    {
      icon: Calendar,
      title: "Receive Requests",
      description: "Get booking requests from clients. Review details and accept the best fit.",
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      accentColor: "text-pink-600",
      lightColor: "bg-pink-100",
      gradient: "from-pink-400/20 to-pink-600/20",
    },
    {
      icon: Camera,
      title: "Deliver Service",
      description: "Provide excellent service and capture memorable moments for your clients.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      accentColor: "text-orange-600",
      lightColor: "bg-orange-100",
      gradient: "from-orange-400/20 to-orange-600/20",
    },
    {
      icon: TrendingUp,
      title: "Get Paid & Reviewed",
      description: "Receive payment and build your reputation with positive reviews.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      accentColor: "text-green-600",
      lightColor: "bg-green-100",
      gradient: "from-green-400/20 to-green-600/20",
    },
  ];

  if (compact) {
    return (
      <section id="how-it-works-section" className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, 50, 0],
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Simple & Effective</span>
            </motion.div>
            
            <motion.h2
              className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Your journey to finding the perfect creative professional in just 3 simple steps
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 opacity-30" />
            
            {consumerSteps.slice(0, 3).map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  {/* Card */}
                  <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-white/50">
                    {/* Background Gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Content */}
                    <div className="relative z-10">
                      {/* Step Number Badge */}
                      <div className="absolute -top-4 -right-4">
                        <motion.div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} text-white font-bold text-xl flex items-center justify-center shadow-lg`}
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.5 }}
                        >
                          {index + 1}
                        </motion.div>
                      </div>

                      {/* Icon Container */}
                      <motion.div
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg relative`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Icon className="w-10 h-10 text-white" />
                        
                        {/* Sparkle Effect */}
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.div>

                      <h3 className="text-2xl font-bold mb-3 text-center">{step.title}</h3>
                      <p className="text-gray-600 text-center leading-relaxed">{step.description}</p>

                      {/* Checkmark */}
                      <motion.div
                        className={`mt-6 flex items-center justify-center gap-2 ${step.accentColor} font-semibold text-sm`}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>Quick & Easy</span>
                      </motion.div>
                    </div>
                  </div>

                  {/* Arrow Between Steps */}
                  {index < 2 && (
                    <motion.div
                      className="hidden md:flex absolute top-20 -right-4 z-20 w-8 h-8 items-center justify-center"
                      animate={{
                        x: [0, 10, 0],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className={`w-8 h-8 ${step.accentColor}`} />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm rounded-full shadow-xl">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700 font-medium">Average booking time: <strong className="text-blue-600">under 5 minutes</strong></span>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-gray-700">Complete Guide</span>
          </motion.div>

          <motion.h2
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            How Photorido Works
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Whether you're looking to hire or offer services, we've made it simple and delightful
          </motion.p>
        </div>

        <Tabs defaultValue="consumer" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-16 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-lg">
            <TabsTrigger value="consumer" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
              For Clients
            </TabsTrigger>
            <TabsTrigger value="vendor" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
              For Professionals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consumer">
            <div className="relative">
              {/* Curved Path SVG */}
              <svg className="hidden lg:block absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                <motion.path
                  d="M 100 150 Q 300 100, 500 150 T 900 150 Q 1100 100, 1300 150"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,10"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid md:grid-cols-5 gap-6 relative z-10">
                {consumerSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/50 h-full">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10">
                          {/* Icon Container with Animation */}
                          <motion.div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg relative`}
                            whileHover={{ 
                              scale: 1.15, 
                              rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                            
                            {/* Pulse Ring */}
                            <motion.div
                              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-20`}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>

                          {/* Step Number */}
                          <div className={`mb-3 text-sm font-bold ${step.accentColor} text-center`}>
                            Step {index + 1}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 text-center">{step.title}</h3>
                          <p className="text-sm text-gray-600 text-center leading-relaxed">{step.description}</p>
                        </div>

                        {/* Corner Decoration */}
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${step.color} opacity-10 rounded-bl-full rounded-tr-3xl`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendor">
            <div className="relative">
              {/* Curved Path SVG */}
              <svg className="hidden lg:block absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
                <motion.path
                  d="M 100 150 Q 300 100, 500 150 T 900 150 Q 1100 100, 1300 150"
                  stroke="url(#gradient2)"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray="10,10"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="grid md:grid-cols-5 gap-6 relative z-10">
                {vendorSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, y: 50, scale: 0.8 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.15 }}
                    >
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-white/50 h-full">
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="relative z-10">
                          {/* Icon Container with Animation */}
                          <motion.div
                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-4 shadow-lg relative`}
                            whileHover={{ 
                              scale: 1.15, 
                              rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className="w-8 h-8 text-white" />
                            
                            {/* Pulse Ring */}
                            <motion.div
                              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.color} opacity-20`}
                              animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0, 0.3],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          </motion.div>

                          {/* Step Number */}
                          <div className={`mb-3 text-sm font-bold ${step.accentColor} text-center`}>
                            Step {index + 1}
                          </div>
                          
                          <h3 className="text-lg font-bold mb-2 text-center">{step.title}</h3>
                          <p className="text-sm text-gray-600 text-center leading-relaxed">{step.description}</p>
                        </div>

                        {/* Corner Decoration */}
                        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${step.color} opacity-10 rounded-bl-full rounded-tr-3xl`} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}