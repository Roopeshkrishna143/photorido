import { motion } from "motion/react";
import { Camera, CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";

interface ComingSoonLandingProps {
  onNavigateToRegistration: () => void;
}

export function ComingSoonLanding({ onNavigateToRegistration }: ComingSoonLandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--blue-50)] via-white to-[var(--blue-100)] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-[var(--blue-200)] rounded-full mix-blend-multiply filter blur-3xl opacity-30"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-10 w-96 h-96 bg-[var(--blue-300)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/2 w-96 h-96 bg-[var(--blue-400)] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <motion.header 
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <img 
          src={logoImage} 
          alt="photorido" 
          className="h-10 w-auto object-contain"
        />
      </motion.header>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            className="flex justify-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-[var(--blue-200)] shadow-lg">
              <Sparkles className="w-5 h-5 text-[var(--blue-600)]" />
              <span className="text-sm text-[var(--blue-700)]">Something Big is Coming</span>
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 text-[var(--primary)] leading-tight">
              A New Home for <br />
              <span className="bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-800)] bg-clip-text text-transparent">
                Photographers
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl text-[var(--muted-foreground)]">
              <span>Coming Soon</span>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Camera className="w-8 h-8 text-[var(--blue-600)]" />
              </motion.div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            className="text-center text-lg sm:text-xl text-[var(--muted-foreground)] mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            We're building a next-generation portal designed to help photographers
            showcase their work, find opportunities, and grow their presence.
          </motion.p>

          {/* Benefits Card */}
          <motion.div
            className="mb-12 rounded-3xl bg-white/40 backdrop-blur-xl border border-white/60 shadow-2xl p-8 sm:p-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="grid gap-6 sm:grid-cols-3">
              <motion.div
                className="flex items-start gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[var(--primary)]">Early access is <strong>FREE</strong></p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[var(--primary)]">Limited-time free registration</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start gap-3"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-[var(--primary)]">Pricing may be introduced later</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="inline-flex flex-col items-center gap-6 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[var(--blue-600)] to-[var(--blue-800)] text-white shadow-2xl">
              <Camera className="w-16 h-16" />
              <div>
                <p className="text-2xl sm:text-3xl mb-2">Register today. Stay ahead.</p>
                <p className="text-blue-100">Be among the first to join our platform</p>
              </div>
              <motion.button
                onClick={onNavigateToRegistration}
                className="group px-8 py-4 bg-white text-[var(--blue-600)] rounded-2xl text-lg hover:bg-blue-50 transition-all shadow-lg flex items-center gap-2"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Register Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.p
            className="text-center text-sm text-[var(--muted-foreground)] mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Join thousands of photographers building their future with us
          </motion.p>
        </div>
      </div>

      {/* Decorative Camera Icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            <Camera className="w-8 h-8 text-[var(--blue-400)]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
