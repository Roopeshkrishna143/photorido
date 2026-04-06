import { Eye, Keyboard, MonitorSmartphone, Volume2 } from "lucide-react";

export function Accessibility() {
  const features = [
    {
      icon: Eye,
      title: "Visual Accessibility",
      description: "High contrast mode, scalable text, and screen reader support for visually impaired users.",
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description: "Full keyboard navigation support for users who cannot use a mouse.",
    },
    {
      icon: MonitorSmartphone,
      title: "Responsive Design",
      description: "Optimized for all devices and screen sizes with touch-friendly interfaces.",
    },
    {
      icon: Volume2,
      title: "Audio Descriptions",
      description: "Alternative text for images and descriptive labels for all interactive elements.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pt-16 py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Accessibility Statement</h1>
              <p className="text-xl text-gray-600">
                We're committed to making Photorido accessible to everyone
              </p>
            </div>
            
            <div className="prose prose-lg max-w-none space-y-8 text-gray-600">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
                <p>
                  Photorido is committed to ensuring digital accessibility for people with disabilities.
                  We are continually improving the user experience for everyone and applying the relevant
                  accessibility standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Accessibility Features</h2>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                          <p className="text-sm">{feature.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Standards</h2>
                <p>
                  We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards.
                  These guidelines explain how to make web content more accessible for people with disabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h2>
                <p>
                  We welcome your feedback on the accessibility of Photorido. Please let us know if you encounter
                  accessibility barriers:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Email: <a href="mailto:accessibility@photorido.com" className="text-blue-600 hover:underline">accessibility@photorido.com</a></li>
                  <li>Phone: +91 98765 43210</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Compatibility</h2>
                <p>
                  Photorido is designed to be compatible with the following assistive technologies:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                  <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                  <li>Browser zoom up to 200%</li>
                  <li>Keyboard-only navigation</li>
                  <li>Voice recognition software</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitations and Alternatives</h2>
                <p>
                  Despite our best efforts to ensure accessibility of Photorido, there may be some limitations.
                  If you experience any issues, please contact us and we will provide alternative access to the content.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}