import { Mail, Phone, MessageCircle, HelpCircle, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { MobileNavBar } from "../MobileNavBar";

interface MobileHelpProps {
  onBack: () => void;
}

const faqs = [
  {
    question: "How do I book a photographer?",
    answer: "Browse photographers, select your preferred professional, click 'Request Booking', choose your date, and submit your request. The photographer will review and confirm.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer: "Yes, you can cancel or reschedule according to the photographer's cancellation policy. Please check the specific terms before booking.",
  },
  {
    question: "How do I become a professional?",
    answer: "Click 'Become a Pro' in the app, register as a vendor, complete your profile with portfolio and services, and start receiving booking requests.",
  },
];

export function MobileHelp({ onBack }: MobileHelpProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="h-full overflow-y-auto pb-24 bg-gray-50">
      <MobileNavBar title="Help Center" onBack={onBack} />

      <div className="px-4 py-6">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2">How Can We Help?</h1>
          <p className="text-gray-600">Get support and find answers</p>
        </motion.div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 gap-3 mb-8">
          {[
            {
              icon: Mail,
              title: "Email Support",
              subtitle: "support@photorido.com",
              color: "from-blue-500 to-blue-600",
              bgColor: "bg-blue-50",
            },
            {
              icon: Phone,
              title: "Phone Support",
              subtitle: "+91 98765 43210",
              color: "from-green-500 to-green-600",
              bgColor: "bg-green-50",
            },
            {
              icon: MessageCircle,
              title: "Live Chat",
              subtitle: "Available 24/7",
              color: "from-purple-500 to-purple-600",
              bgColor: "bg-purple-50",
            },
          ].map((option, index) => {
            const Icon = option.icon;
            return (
              <motion.button
                key={index}
                className="bg-white rounded-2xl p-4 shadow-md active:scale-95 transition-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-base mb-1">{option.title}</h3>
                    <p className="text-sm text-gray-600">{option.subtitle}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* FAQs */}
        <div className="mb-6">
          <h2 className="font-bold text-xl mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.3 }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-4 flex items-start gap-3 active:bg-gray-50 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-base mb-1">{faq.question}</h3>
                    {expandedFaq === index && (
                      <motion.p
                        className="text-sm text-gray-600 leading-relaxed mt-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {faq.answer}
                      </motion.p>
                    )}
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      expandedFaq === index ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="font-bold text-lg mb-2">Still Need Help?</h3>
          <p className="text-sm text-blue-100 mb-4">
            Our support team is here to assist you
          </p>
          <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-xl active:scale-95 transition-transform">
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
}

