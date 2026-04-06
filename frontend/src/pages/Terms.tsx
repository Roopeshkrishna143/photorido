import { FileText } from "lucide-react";

export function Terms() {
  return (
    <div>
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-8">
              <FileText className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold">Terms of Service</h1>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <p className="text-sm text-gray-500">Last updated: March 22, 2026</p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p>By accessing and using Photorido, you accept and agree to be bound by the terms and provision of this agreement.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use of Service</h2>
                <p>You agree to use the service only for lawful purposes and in accordance with these Terms. You are responsible for all activity under your account.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Professional Accounts</h2>
                <p>Professionals must provide accurate information, maintain professional conduct, and honor all confirmed bookings.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Client Responsibilities</h2>
                <p>Clients must communicate clearly, honor confirmed bookings, and provide accurate event information.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payments and Fees</h2>
                <p>All payments are processed securely through our platform. Professionals pay a 10% commission on completed bookings.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancellation Policy</h2>
                <p>Cancellation terms are set by individual professionals and must be honored by all parties.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
                <p>Photorido is a marketplace platform. We are not responsible for the quality of services provided by professionals.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
                <p>For questions about these Terms, contact us at <a href="mailto:legal@photorido.com" className="text-blue-600 hover:underline">legal@photorido.com</a></p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}