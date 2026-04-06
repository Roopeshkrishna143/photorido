import { motion } from "motion/react";
import { Heart, Users, Globe, Award, Target, Sparkles } from "lucide-react";

export function OurStory() {
  const timeline = [
    {
      year: "2020",
      title: "The Beginning",
      description: "Photorido was founded with a simple mission: to connect talented creative professionals with clients worldwide.",
    },
    {
      year: "2021",
      title: "Rapid Growth",
      description: "Expanded to 10+ countries with over 500 professionals joining our platform.",
    },
    {
      year: "2022",
      title: "Innovation",
      description: "Launched our smart booking calendar and AI-powered matching system.",
    },
    {
      year: "2023",
      title: "Community Focus",
      description: "Reached 5,000+ happy clients and built a thriving creative community.",
    },
    {
      year: "2024",
      title: "Global Impact",
      description: "Operating in 25+ countries with 2,000+ verified professionals.",
    },
  ];

  const values = [
    {
      icon: Heart,
      title: "Passion First",
      description: "We believe in the power of passionate creative professionals to capture life's most precious moments.",
      color: "from-red-500 to-pink-500",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our platform thrives on the trust and collaboration between clients and professionals.",
      color: "from-blue-500 to-purple-500",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connecting local talent with clients worldwide, breaking geographical boundaries.",
      color: "from-green-500 to-teal-500",
    },
    {
      icon: Award,
      title: "Quality Excellence",
      description: "We maintain the highest standards through verification and community reviews.",
      color: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-5 h-5" />
              <span className="font-semibold">Our Journey</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              From a simple idea to a global marketplace connecting creative professionals
              with clients who value their craft.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold">Our Mission</h2>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                At Photorido, we're on a mission to democratize access to world-class creative
                talent. We believe that everyone deserves to have their special moments captured
                beautifully, and every talented professional deserves to showcase their skills
                to a global audience.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We're not just a booking platform – we're building a community where creativity
                flourishes, trust is paramount, and beautiful moments are preserved forever.
              </p>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-bold text-blue-600 mb-1">5,000+</div>
                <div className="text-sm text-gray-600">Happy Clients</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-gray-600">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">Key milestones that shaped Photorido</p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 hidden md:block" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  className="relative pl-0 md:pl-24"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Year Badge */}
                  <div className="absolute left-0 hidden md:flex w-16 h-16 bg-white rounded-full border-4 border-blue-500 items-center justify-center font-bold text-blue-600 shadow-lg">
                    {item.year}
                  </div>

                  {/* Content */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg">
                    <div className="md:hidden text-blue-600 font-bold text-lg mb-2">{item.year}</div>
                    <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Be Part of Our Story</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of professionals and clients who trust Photorido
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/search"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Find a Professional
              </a>
              <a
                href="/become-a-pro"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
              >
                Become a Pro
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}