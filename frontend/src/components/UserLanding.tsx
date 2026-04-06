import { motion } from "motion/react";
import { 
  Search, 
  Star, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles,
  Heart,
  Shield,
  Clock,
  DollarSign,
  MessageCircle,
  Camera,
  Video,
  Palette,
  Award,
  Users,
  Zap
} from "lucide-react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";

interface UserLandingProps {
  onNavigateToHome: () => void;
  onSwitchToPhotographerLanding: () => void;
}

export function UserLanding({ onNavigateToHome, onSwitchToPhotographerLanding }: UserLandingProps) {
  const problems = [
    {
      icon: "😰",
      problem: "Can't find reliable photographers nearby?",
      solution: "Browse verified professionals in your area"
    },
    {
      icon: "💸",
      problem: "Worried about hidden costs?",
      solution: "Transparent pricing with no surprises"
    },
    {
      icon: "⏰",
      problem: "Spending hours comparing options?",
      solution: "Filter and compare in seconds"
    },
    {
      icon: "❓",
      problem: "Unsure about photographer quality?",
      solution: "Real reviews from real clients"
    }
  ];

  const categories = [
    { icon: Heart, name: "Wedding", color: "from-pink-500 to-rose-600", count: "2,500+" },
    { icon: Users, name: "Portrait", color: "from-purple-500 to-purple-600", count: "3,200+" },
    { icon: Camera, name: "Event", color: "from-blue-500 to-blue-600", count: "1,800+" },
    { icon: Video, name: "Commercial", color: "from-green-500 to-green-600", count: "1,200+" },
    { icon: Palette, name: "Fashion", color: "from-orange-500 to-orange-600", count: "900+" },
    { icon: Award, name: "Fine Art", color: "from-indigo-500 to-indigo-600", count: "650+" }
  ];

  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find photographers by location, specialty, price range, and availability in seconds."
    },
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "All photographers are verified with portfolios, reviews, and credentials you can trust."
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "See upfront pricing, compare packages, and book within your budget with confidence."
    },
    {
      icon: MessageCircle,
      title: "Direct Communication",
      description: "Chat directly with photographers, discuss your vision, and get instant responses."
    },
    {
      icon: Clock,
      title: "Instant Booking",
      description: "Book your photographer instantly with our secure payment system and automated scheduling."
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "Read authentic reviews, view portfolios, and choose from top-rated professionals."
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Search & Discover",
      description: "Tell us what you need - location, style, and budget. Our smart algorithm finds perfect matches.",
      icon: "🔍"
    },
    {
      step: "2",
      title: "Compare & Choose",
      description: "Review portfolios, read reviews, compare prices, and shortlist your favorites.",
      icon: "⚖️"
    },
    {
      step: "3",
      title: "Book & Relax",
      description: "Book instantly, communicate directly, and let professionals capture your special moments.",
      icon: "✨"
    }
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
                onClick={onSwitchToPhotographerLanding}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors"
              >
                For Photographers
              </button>
              <motion.button
                onClick={onNavigateToHome}
                className="px-6 py-2 bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] text-white rounded-xl hover:from-[var(--blue-700)] hover:to-[var(--blue-800)] transition-all shadow-lg text-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Find Photographers
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
            src="https://images.unsplash.com/photo-1768611260442-6c743f107d69?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBiZWF1dGlmdWwlMjBtb21lbnRzfGVufDF8fHx8MTc3MDEzMDQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Beautiful moments"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              <Camera className="w-6 h-6 text-white/30" />
            </motion.div>
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
              <span className="text-sm">Your Perfect Photographer is Just a Click Away</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Find Your Dream
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
              Photographer Today
            </span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Connect with verified professionals worldwide. Browse portfolios, compare prices, and book instantly for weddings, events, portraits, and more.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <motion.button
              onClick={onNavigateToHome}
              className="group px-8 py-4 bg-white text-[var(--blue-600)] rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-2 w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5" />
              Start Searching Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-2xl text-lg hover:bg-white/10 transition-all w-full sm:w-auto"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              How It Works
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8 text-blue-100"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>10,000+ Verified Photographers</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>150+ Countries</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[var(--blue-50)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-[var(--primary)]">
              We Solve Your <span className="text-[var(--blue-600)]">Biggest Problems</span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
              Finding the right photographer shouldn't be stressful. We make it simple.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((item, index) => (
              <motion.div
                key={index}
                className="relative p-6 rounded-3xl bg-white border border-gray-200 hover:border-[var(--blue-300)] transition-all hover:shadow-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h4 className="text-lg mb-3 text-[var(--primary)]">{item.problem}</h4>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[var(--muted-foreground)]">{item.solution}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-[var(--primary)]">
              Browse By <span className="text-[var(--blue-600)]">Category</span>
            </h2>
            <p className="text-xl text-[var(--muted-foreground)]">
              Whatever the occasion, we have the perfect photographer for you
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={index}
                  className="group relative p-6 rounded-3xl bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 hover:border-transparent transition-all hover:shadow-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                >
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  
                  <div className="relative z-10 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${category.color} p-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-full h-full text-white" />
                    </div>
                    <h3 className="text-lg mb-1 text-[var(--primary)]">{category.name}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{category.count}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-[var(--blue-50)] to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4 text-[var(--primary)]">
              Book in <span className="text-[var(--blue-600)]">3 Easy Steps</span>
            </h2>
          </motion.div>

          <div className="max-w-5xl mx-auto relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-[var(--blue-200)] via-[var(--blue-400)] to-[var(--blue-600)]" />

            <div className="grid md:grid-cols-3 gap-8 relative">
              {howItWorks.map((item, index) => (
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

      {/* Features Section with Background */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--blue-600)]/95 to-[var(--blue-800)]/95 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1659100946660-d743d8d7952e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNsaWVudCUyMGN1c3RvbWVyJTIwcGhvdG9ncmFwaGVyJTIwcGhvdG9zaG9vdHxlbnwxfHx8fDE3NzAxMzA0Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Happy client"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <motion.div
            className="text-center mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl mb-4">
              Why Choose <span className="text-blue-200">photorido</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              We're not just a directory. We're your partner in finding the perfect creative professional.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/20 p-4 mb-6">
                    <Icon className="w-full h-full text-white" />
                  </div>
                  <h3 className="text-2xl mb-3 text-white">{feature.title}</h3>
                  <p className="text-blue-100">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[var(--blue-50)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="max-w-4xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-[var(--blue-600)] to-[var(--blue-800)] text-white shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated Background */}
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
              <div className="text-6xl mb-6">📸</div>
              <h2 className="text-4xl sm:text-5xl mb-4">Ready to Find Your Photographer?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join thousands of happy clients who found their perfect photographer on photorido.
                <br />
                <strong className="text-white">It's 100% FREE to search and book!</strong>
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  onClick={onNavigateToHome}
                  className="group px-8 py-4 bg-white text-[var(--blue-600)] rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-2xl flex items-center gap-2"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Search className="w-6 h-6" />
                  Start Your Search Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200 mt-6">
                <span className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  Instant results
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Verified professionals
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  No booking fees
                </span>
              </div>
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
              <button onClick={onSwitchToPhotographerLanding} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors">
                Switch to Photographer View
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
