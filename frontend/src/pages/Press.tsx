import { motion } from "motion/react";
import { Newspaper, Download, Mail, Award } from "lucide-react";

export function Press() {
  const pressReleases = [
    {
      date: "March 15, 2026",
      title: "Photorido Raises $10M Series A to Expand Global Marketplace",
      excerpt: "Leading creative marketplace announces major funding round to accelerate growth across 25+ countries.",
      category: "Funding",
    },
    {
      date: "February 20, 2026",
      title: "Platform Reaches 2,000 Verified Professionals Milestone",
      excerpt: "Photorido celebrates significant growth in verified creative professional community.",
      category: "Milestone",
    },
    {
      date: "January 10, 2026",
      title: "New AI-Powered Matching System Launched",
      excerpt: "Revolutionary technology helps clients find perfect creative professionals faster.",
      category: "Product",
    },
    {
      date: "December 5, 2025",
      title: "Photorido Wins 'Best Marketplace Platform' Award",
      excerpt: "Industry recognition for innovation in creative services marketplace.",
      category: "Awards",
    },
  ];

  const mediaKit = [
    { name: "Company Logo (PNG)", size: "2.4 MB" },
    { name: "Company Logo (SVG)", size: "124 KB" },
    { name: "Brand Guidelines", size: "8.1 MB" },
    { name: "Product Screenshots", size: "12.5 MB" },
    { name: "Founder Photos", size: "4.2 MB" },
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
            <div className="flex items-center justify-center gap-2 mb-6">
              <Newspaper className="w-8 h-8" />
              <span className="text-lg font-semibold">Press Room</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Newsroom</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Latest news, updates, and media resources from Photorido
            </p>
          </motion.div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Media Inquiries</h2>
              <p className="text-gray-600">For press-related questions and interview requests</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:press@photorido.com"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                press@photorido.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Press Releases</h2>
            <p className="text-xl text-gray-600">Latest announcements and company news</p>
          </motion.div>

          <div className="space-y-6">
            {pressReleases.map((release, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {release.category}
                      </span>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3">{release.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{release.excerpt}</p>
                    <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                      Read Full Story →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Media Kit</h2>
            <p className="text-xl text-gray-600">Download logos, brand assets, and resources</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mediaKit.map((item, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Download className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500">{item.size}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 text-center bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Award className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Need Something Else?</h3>
            <p className="text-gray-600 mb-6">
              Contact our press team for custom assets or specific requests
            </p>
            <a
              href="mailto:press@photorido.com"
              className="inline-flex px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Contact Press Team
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
