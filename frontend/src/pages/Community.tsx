import { motion } from "motion/react";
import { Users, MessageCircle, Calendar, Award, Heart, Sparkles } from "lucide-react";

export function Community() {
  const communityFeatures = [
    {
      icon: MessageCircle,
      title: "Professional Forums",
      description: "Connect with other professionals, share experiences, and get advice from the community.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Calendar,
      title: "Events & Meetups",
      description: "Join local and virtual events to network and learn from industry experts.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: Award,
      title: "Success Stories",
      description: "Get inspired by professionals who have built thriving businesses on Photorido.",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: Users,
      title: "Mentorship Program",
      description: "Learn from experienced professionals or become a mentor to help others succeed.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const successStories = [
    {
      name: "Priya Sharma",
      role: "Wedding Photographer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      story: "Grew my business by 300% in my first year on Photorido. The platform made it easy to connect with clients worldwide.",
      bookings: "150+",
    },
    {
      name: "Rajesh Kumar",
      role: "Video Editor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      story: "From freelancer to full-time professional. Photorido gave me the tools and exposure I needed.",
      bookings: "200+",
    },
    {
      name: "Ananya Patel",
      role: "Album Designer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      story: "The community support and resources helped me build a sustainable creative business.",
      bookings: "100+",
    },
  ];

  const upcomingEvents = [
    {
      title: "Photography Masterclass",
      date: "April 15, 2026",
      type: "Virtual",
      attendees: 150,
    },
    {
      title: "Mumbai Photographers Meetup",
      date: "April 22, 2026",
      type: "In-Person",
      attendees: 45,
    },
    {
      title: "Business Growth Workshop",
      date: "May 5, 2026",
      type: "Virtual",
      attendees: 200,
    },
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
            <Users className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Community</h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join a thriving community of 2,000+ creative professionals from around the world
            </p>
          </motion.div>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "2,000+", label: "Professionals" },
              { value: "5,000+", label: "Happy Clients" },
              { value: "25+", label: "Countries" },
              { value: "4.9", label: "Avg Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Community Features</h2>
            <p className="text-xl text-gray-600">
              Everything you need to connect, learn, and grow
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {communityFeatures.map((feature, index) => {
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

      {/* Success Stories */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md mb-4">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-gray-700">Success Stories</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">Community Champions</h2>
            <p className="text-xl text-gray-600">
              Real stories from professionals who found success on Photorido
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <img
                  src={story.image}
                  alt={story.name}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
                <h3 className="font-bold text-xl text-center mb-1">{story.name}</h3>
                <p className="text-blue-600 text-center text-sm mb-4">{story.role}</p>
                <p className="text-gray-600 text-center italic mb-4">"{story.story}"</p>
                <div className="text-center pt-4 border-t border-gray-100">
                  <div className="text-2xl font-bold text-blue-600">{story.bookings}</div>
                  <div className="text-xs text-gray-500">Completed Bookings</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-600">
              Join us for workshops, meetups, and learning opportunities
            </p>
          </motion.div>

          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
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
                    <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {event.date}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {event.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {event.attendees} attending
                      </span>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap">
                    Register Now
                  </button>
                </div>
              </motion.div>
            ))}
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
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl text-blue-100 mb-8">
              Be part of a supportive network of creative professionals
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