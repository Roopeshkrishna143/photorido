import { motion } from "motion/react";
import { BookOpen, Video, Download, FileText, Lightbulb, TrendingUp } from "lucide-react";

export function Resources() {
  const resourceCategories = [
    {
      icon: BookOpen,
      title: "Guides & Tutorials",
      description: "Step-by-step guides to help you succeed on Photorido",
      color: "from-blue-500 to-blue-600",
      resources: [
        "Getting Started Guide",
        "Profile Optimization Tips",
        "Photography Best Practices",
        "Client Communication Guide",
      ],
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch and learn from experienced professionals",
      color: "from-purple-500 to-purple-600",
      resources: [
        "Platform Tour Video",
        "Booking Management Tutorial",
        "Portfolio Showcase Tips",
        "Success Stories & Interviews",
      ],
    },
    {
      icon: Download,
      title: "Templates & Tools",
      description: "Downloadable resources to streamline your work",
      color: "from-pink-500 to-pink-600",
      resources: [
        "Contract Templates",
        "Invoice Templates",
        "Shot List Templates",
        "Client Questionnaire Forms",
      ],
    },
    {
      icon: FileText,
      title: "Business Resources",
      description: "Grow your creative business with expert advice",
      color: "from-orange-500 to-orange-600",
      resources: [
        "Pricing Strategy Guide",
        "Marketing Your Services",
        "Managing Client Expectations",
        "Tax & Legal Basics",
      ],
    },
  ];

  const featuredArticles = [
    {
      title: "10 Tips to Build a Standout Portfolio",
      category: "Portfolio",
      readTime: "5 min read",
    },
    {
      title: "How to Price Your Photography Services",
      category: "Business",
      readTime: "8 min read",
    },
    {
      title: "Client Communication Best Practices",
      category: "Communication",
      readTime: "6 min read",
    },
    {
      title: "Growing Your Business on Photorido",
      category: "Growth",
      readTime: "10 min read",
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
            <Lightbulb className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Resources</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Everything you need to succeed as a creative professional on Photorido
            </p>
          </motion.div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {resourceCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{category.title}</h3>
                  <p className="text-gray-600 mb-6">{category.description}</p>
                  
                  <ul className="space-y-3">
                    {category.resources.map((resource, rIndex) => (
                      <li key={rIndex}>
                        <a
                          href="#"
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          {resource}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Featured Articles</h2>
            <p className="text-xl text-gray-600">
              Expert insights and advice from successful professionals
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {featuredArticles.map((article, index) => (
              <motion.a
                key={index}
                href="#"
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">{article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-blue-600 font-semibold">
                  Read Article →
                </p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <TrendingUp className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Business?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of successful professionals on Photorido
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
    </div>
  );
}