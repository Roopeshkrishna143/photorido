import { Shield } from "lucide-react";

export function Privacy() {
  return (
    <div>
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-8">
              <Shield className="w-10 h-10 text-blue-600" />
              <h1 className="text-4xl font-bold">Privacy Policy</h1>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-6 text-gray-600">
              <p className="text-sm text-gray-500">Last updated: March 22, 2026</p>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p>We collect information you provide directly to us when you create an account, update your profile, make bookings, or communicate with us.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <p>We do not share your personal information with third parties except as described in this policy or with your consent.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p>We use industry-standard security measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <p>You have the right to access, update, or delete your personal information at any time through your account settings.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
                <p>If you have questions about this Privacy Policy, please contact us at <a href="mailto:privacy@photorido.com" className="text-blue-600 hover:underline">privacy@photorido.com</a></p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}