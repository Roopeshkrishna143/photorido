import { Breadcrumb } from "../components/Breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { HelpCircle, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "../components/ui/button";

export function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumb items={[{ label: "Help Center" }]} />

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How Can We Help You?</h1>
          <p className="text-lg text-gray-600">
            Get support and find answers to common questions
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="text-center pt-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-4">support@photorido.com</p>
              <Button variant="outline" size="sm">Send Email</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center pt-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-4">+91 98765 43210</p>
              <Button variant="outline" size="sm">Call Now</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center pt-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Live Chat</h3>
              <p className="text-sm text-gray-600 mb-4">Available 24/7</p>
              <Button variant="outline" size="sm">Start Chat</Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {[
              {
                question: "How do I book a photographer?",
                answer: "Browse photographers, select your preferred professional, click 'Request Booking', choose your date, and submit your request. The photographer will review and confirm."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, debit cards, UPI, and net banking through our secure payment gateway."
              },
              {
                question: "Can I cancel or reschedule a booking?",
                answer: "Yes, you can cancel or reschedule according to the photographer's cancellation policy. Please check the specific terms before booking."
              },
              {
                question: "How do I become a professional on Photorido?",
                answer: "Click 'Become a Pro' in the header, register as a vendor, complete your profile with portfolio and services, and start receiving booking requests."
              },
            ].map((faq, index) => (
              <div key={index} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

