import { motion } from "motion/react";
import { Crown, TrendingUp, Shield, Users, Globe, Zap, Star, CheckCircle } from "lucide-react";

export function ProBenefits() {
  const benefits = [
    {
      icon: Globe,
      title: "Global Exposure",
      description: "Reach clients worldwide and expand your business beyond local boundaries.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Access powerful tools and analytics to track and accelerate your growth.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Shield,
      title: "Verified Badge",
      description: "Stand out with our verification badge that builds instant trust with clients.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Join a network of professionals, share knowledge, and grow together.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Easy Management",
      description: "Streamlined booking calendar, payments, and client communication in one place.",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Star,
      title: "Build Your Reputation",
      description: "Collect reviews and ratings that showcase your expertise to potential clients.",
      color: "from-yellow-500 to-yellow-600",
    },
  ];

  const features = [
    "Smart booking calendar with color-coded availability",
    "Secure payment processing",
    "Portfolio showcase with unlimited uploads",
    "Real-time messaging with clients",
    "Analytics and insights dashboard",
    "Mobile app for on-the-go management",
    "24/7 customer support",
    "Marketing and promotion tools",
    "Professional resources and training",
    "Community forums and networking events",
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            className="text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Crown className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Pro Benefits</h1>
            <p className="text-xl text-blue-100 leading-relaxed mb-8">
              Everything you need to build and grow a successful creative business
            </p>
            <a
              href="/become-a-pro"
              className="inline-flex px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Become a Professional
            </a>
          </motion.div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Why Join Photorido?</h2>
            <p className="text-xl text-gray-600">
              Powerful benefits designed to help you succeed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-xl text-gray-600">
              All features included in your professional account
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">
              No hidden fees. Only pay when you get bookings.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">Free to Join</h3>
              <p className="text-gray-600 mb-6">
                Create your profile and start receiving booking requests at no cost
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-2">₹0</div>
              <p className="text-sm text-gray-500">Setup fee</p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl text-white relative overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 bg-yellow-400 text-blue-900 px-4 py-1 text-sm font-bold rounded-bl-xl">
                POPULAR
              </div>
              <h3 className="text-2xl font-bold mb-4">Commission</h3>
              <p className="text-blue-100 mb-6">
                Small commission only when you successfully complete a booking
              </p>
              <div className="text-4xl font-bold mb-2">10%</div>
              <p className="text-sm text-blue-100">Per completed booking</p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-4">Instant Payouts</h3>
              <p className="text-gray-600 mb-6">
                Get paid quickly after service completion
              </p>
              <div className="text-4xl font-bold text-blue-600 mb-2">2-3</div>
              <p className="text-sm text-gray-500">Business days</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join 2,000+ successful professionals on Photorido
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/become-a-pro"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Become a Professional
              </a>
              <a
                href="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}