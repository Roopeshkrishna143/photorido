import { motion } from "motion/react";
import { Mail, Phone, MessageCircle, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { showSuccessAlert } from "../lib/alerts";

export function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await showSuccessAlert("Message sent", {
      text: "We'll get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      value: "support@photorido.com",
      description: "For general inquiries and support",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+91 98765 43210",
      description: "Mon-Fri, 9am-6pm IST",
      color: "from-green-500 to-green-600",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      value: "Available 24/7",
      description: "Instant support via chat",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      value: "Mumbai, India",
      description: "By appointment only",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{method.title}</h3>
                  <p className="text-blue-600 font-semibold mb-1">{method.value}</p>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </motion.div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-4">Send us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form and our team will get back to you within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Message *</label>
                  <textarea
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </motion.div>

            <motion.div
              className="lg:sticky lg:top-24"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold mb-2">How quickly will I get a response?</h4>
                    <p className="text-gray-600 text-sm">
                      We aim to respond to all inquiries within 24 hours during business days.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Can I schedule a call?</h4>
                    <p className="text-gray-600 text-sm">
                      Yes! Mention your preferred time in the message and we'll arrange a call.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Do you offer technical support?</h4>
                    <p className="text-gray-600 text-sm">
                      Absolutely. Our support team is available 24/7 via live chat and email.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2">Where is your office located?</h4>
                    <p className="text-gray-600 text-sm">
                      Our headquarters is in Mumbai, India. We operate globally with remote teams.
                    </p>
                  </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-xl">
                  <h4 className="font-bold mb-2">Need immediate help?</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    Check out our Help Center for instant answers to common questions.
                  </p>
                  <a
                    href="/help"
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    Visit Help Center {"->"}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}

