import { motion } from "motion/react";
import { Briefcase, Heart, TrendingUp, Users, MapPin, Clock, ArrowRight } from "lucide-react";

export function Careers() {
  const openings = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote / Mumbai",
      type: "Full-time",
      description: "Build scalable features for our global marketplace platform.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote / Bangalore",
      type: "Full-time",
      description: "Create beautiful, intuitive experiences for our users.",
    },
    {
      title: "Customer Success Manager",
      department: "Support",
      location: "Mumbai",
      type: "Full-time",
      description: "Help our community of professionals and clients succeed.",
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Drive growth and build our brand across markets.",
    },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health insurance for you and your family",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: TrendingUp,
      title: "Growth & Learning",
      description: "Annual learning budget and career development programs",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Users,
      title: "Flexible Work",
      description: "Remote-first culture with flexible working hours",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Briefcase,
      title: "Equity Options",
      description: "Stock options to share in our success",
      color: "from-orange-500 to-yellow-500",
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Join Our Team</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Help us build the future of creative marketplaces and empower
              professionals worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Why Photorido?</h2>
            <p className="text-xl text-gray-600">
              We're building something special. Come be part of it.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Open Positions</h2>
            <p className="text-xl text-gray-600">
              Find your next opportunity with us
            </p>
          </motion.div>

          <div className="space-y-6">
            {openings.map((job, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{job.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.type}</span>
                      </div>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Can't Find Position */}
          <motion.div
            className="mt-12 text-center bg-white rounded-2xl p-8 shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-2">Can't find the right position?</h3>
            <p className="text-gray-600 mb-6">
              We're always looking for talented people. Send us your resume!
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              Submit Resume
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
