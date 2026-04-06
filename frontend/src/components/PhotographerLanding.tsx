import { motion } from "motion/react";
import { 
  Camera, 
  TrendingUp, 
  Users, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Target,
  Zap,
  Award,
  BarChart3,
  DollarSign,
  Clock,
  Shield
} from "lucide-react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";

interface PhotographerLandingProps {
  onNavigateToRegistration: () => void;
  onSwitchToUserLanding: () => void;
}

export function PhotographerLanding({ onNavigateToRegistration, onSwitchToUserLanding }: PhotographerLandingProps) {
  const stats = [
    { value: "10,000+", label: "Active Photographers", icon: Camera },
    { value: "50,000+", label: "Happy Clients", icon: Users },
    { value: "150+", label: "Countries", icon: Globe },
    { value: "₹500Cr+", label: "Revenue Generated", icon: TrendingUp }
  ];

  const features = [
    {
      icon: Target,
      title: "Get Discovered",
      description: "Showcase your portfolio to millions of clients actively searching for photographers worldwide.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: DollarSign,
      title: "Grow Your Income",
      description: "Connect with high-value clients and increase your bookings by 3x on average.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Zap,
      title: "Instant Bookings",
      description: "Real-time booking system with secure payments and automated scheduling.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Track your performance, client engagement, and revenue growth with powerful insights.",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Shield,
      title: "Verified Badge",
      description: "Build trust with clients through our verification process and review system.",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Award,
      title: "Premium Exposure",
      description: "Featured listings, promoted content, and priority placement in search results.",
      color: "from-pink-500 to-pink-600"
    }
  ];

  const benefits = [
    "Free profile creation - No credit card required",
    "Limited-time early access pricing",
    "Keep 90% of your earnings",
    "Unlimited portfolio uploads",
    "Direct client messaging",
    "Mobile app access (Coming Soon)"
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation Header */}
      <motion.nav 
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <img 
              src={logoImage} 
              alt="photorido" 
              className="h-8 w-auto object-contain"
            />
            <div className="flex items-center gap-4">
              <button
                onClick={onSwitchToUserLanding}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors"
              >
                For Clients
              </button>
              <motion.button
                onClick={onNavigateToRegistration}
                className="px-6 py-2 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white rounded-xl hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] transition-all shadow-lg text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join Now
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Background Image */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--blue-900)]/90 via-[var(--blue-800)]/85 to-[var(--blue-600)]/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1758613654584-86714842a2d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwaG90b2dyYXBoZXIlMjBjYW1lcmElMjBlcXVpcG1lbnQlMjBzdHVkaW98ZW58MXx8fHwxNzcwMTMwMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Photographer"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-30 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-8">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">Join the Future of Photography Business</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Turn Your Passion Into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Profitable Business
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connect with clients worldwide, showcase your portfolio, and grow your photography business with the world's leading creative platform.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.button
              onClick={onNavigateToRegistration}
              className="group px-8 py-4 bg-white text-[var(--blue-600)] rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl text-lg hover:bg-white/10 transition-all w-full sm:w-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="w-8 h-8 mb-3 mx-auto text-blue-200" />
                  <div className="text-3xl mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Features Section with Infographics */}
      <section className="py-20 bg-gradient-to-b from-white to-[var(--blue-50)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-[var(--primary)]">
              Everything You Need to <span className="text-[var(--blue-600)]">Succeed</span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Powerful tools designed specifically for professional photographers
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="group relative p-8 rounded-3xl bg-white border border-gray-200 hover:border-[var(--blue-300)] transition-all hover:shadow-2xl"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl mb-3 text-[var(--primary)]">{feature.title}</h3>
                  <p className="text-[var(--muted-foreground)] leading-relaxed">{feature.description}</p>
                  
                  {/* Decorative gradient */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl blur-2xl transition-opacity`} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works - Infographic Style */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-[var(--primary)]">
              Get Started in <span className="text-[var(--blue-600)]">3 Simple Steps</span>
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[var(--blue-200)] via-[var(--blue-400)] to-[var(--blue-600)]" />

            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "01",
                  title: "Create Your Profile",
                  description: "Sign up in 2 minutes and build your stunning portfolio with our easy-to-use tools.",
                  icon: "📸"
                },
                {
                  step: "02",
                  title: "Get Verified",
                  description: "Complete our quick verification process to build trust and stand out from the crowd.",
                  icon: "✓"
                },
                {
                  step: "03",
                  title: "Start Earning",
                  description: "Receive booking requests, connect with clients, and grow your photography business.",
                  icon: "💰"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="relative z-10 text-center">
                    <motion.div
                      className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--blue-600)] to-[var(--blue-800)] flex items-center justify-center text-5xl shadow-2xl"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.div>
                    <div className="text-6xl font-bold text-[var(--blue-100)] mb-4">{item.step}</div>
                    <h3 className="text-2xl mb-3 text-[var(--primary)]">{item.title}</h3>
                    <p className="text-[var(--muted-foreground)]">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section with Background */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-600)]/95 to-[var(--blue-800)]/95 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1758613653298-738e98658e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHBob3RvZ3JhcGhlciUyMHdvcmtpbmclMjBwb3J0Zm9saW98ZW58MXx8fHwxNzcwMTMwMzg1fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Creative photographer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h2 className="text-4xl sm:text-5xl mb-6">
                Why Photographers Choose <span className="text-blue-200">photorido</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of successful photographers who have transformed their business with our platform.
              </p>
              
              <div className="grid gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="hidden lg:block"
            >
              {/* Decorative Stats Card */}
              <div className="relative">
                <motion.div
                  className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="text-center mb-8">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-3xl text-white mb-2">Average Growth</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center p-4 rounded-xl bg-white/10">
                      <div className="text-4xl text-white mb-2">300%</div>
                      <div className="text-sm text-blue-200">Booking Increase</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10">
                      <div className="text-4xl text-white mb-2">₹2L+</div>
                      <div className="text-sm text-blue-200">Monthly Revenue</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10">
                      <div className="text-4xl text-white mb-2">4.9★</div>
                      <div className="text-sm text-blue-200">Avg. Rating</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-white/10">
                      <div className="text-4xl text-white mb-2">24/7</div>
                      <div className="text-sm text-blue-200">Support</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--blue-50)] to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-[var(--blue-600)] to-[var(--blue-800)] text-white shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Background Circles */}
            <div className="absolute inset-0 opacity-10">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${100 + i * 50}px`,
                    height: `${100 + i * 50}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.1, 0.3],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="text-6xl mb-6">🎯</div>
              <h2 className="text-4xl sm:text-5xl mb-4">Ready to Grow Your Business?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join photorido today and start connecting with clients who value your work.
                <br />
                <strong className="text-white">Early registration is FREE!</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={onNavigateToRegistration}
                  className="group px-8 py-4 bg-white text-[var(--blue-600)] rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Camera className="w-6 h-6" />
                  Register Now - It's FREE
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <p className="text-sm text-blue-200 mt-6">
                <Clock className="w-4 h-4 inline mr-1" />
                Limited time offer • No credit card required • Cancel anytime
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-white border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted-foreground)]">
              © 2025 photorido. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button onClick={onSwitchToUserLanding} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors">
                Switch to Client View
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
