import { motion } from "motion/react";
import { Shield, CheckCircle, AlertTriangle, Lock, Eye, UserCheck } from "lucide-react";

export function Safety() {
  const safetyFeatures = [
    {
      icon: UserCheck,
      title: "Verified Professionals",
      description: "All professionals undergo identity verification and background checks before joining our platform.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Lock,
      title: "Secure Payments",
      description: "Your payment information is encrypted and protected with industry-standard security protocols.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Eye,
      title: "Review System",
      description: "Transparent ratings and reviews help you make informed decisions about professionals.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Shield,
      title: "Trust & Safety Team",
      description: "Dedicated team monitoring platform activity 24/7 to ensure community safety.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const guidelines = [
    {
      title: "For Clients",
      points: [
        "Always book through the platform to ensure protection",
        "Review professional profiles and ratings carefully",
        "Communicate through our messaging system",
        "Report any suspicious behavior immediately",
        "Never share sensitive personal information",
        "Meet in public places for initial consultations",
      ],
    },
    {
      title: "For Professionals",
      points: [
        "Keep your profile information accurate and up-to-date",
        "Respond to booking requests promptly",
        "Maintain professional communication at all times",
        "Honor your commitments and scheduled bookings",
        "Report inappropriate client behavior",
        "Protect client privacy and personal information",
      ],
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white overflow-hidden">
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
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Safety Center</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Your safety is our top priority. Learn how we protect our community.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">How We Keep You Safe</h2>
            <p className="text-xl text-gray-600">
              Multiple layers of protection for our community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {safetyFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Safety Guidelines</h2>
            <p className="text-xl text-gray-600">
              Best practices for a safe experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {guidelines.map((guideline, gIndex) => (
              <motion.div
                key={gIndex}
                className="bg-white rounded-2xl p-8 shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gIndex * 0.2 }}
              >
                <h3 className="text-2xl font-bold mb-6">{guideline.title}</h3>
                <ul className="space-y-4">
                  {guideline.points.map((point, pIndex) => (
                    <li key={pIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Report Issues */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <AlertTriangle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Report Safety Concerns</h2>
            <p className="text-xl text-orange-100 mb-8">
              If you encounter any safety issues or suspicious behavior, please report it immediately.
              Our Trust & Safety team will investigate within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Report an Issue
              </a>
              <a
                href="/help"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Get Help
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}