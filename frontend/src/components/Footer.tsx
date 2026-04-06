import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react";
import { motion } from "motion/react";
import logoImage from "figma:asset/1a7396ce0df98b8e9d99c9694dadb671a2b68d89.png";
import { Link } from "react-router";

interface FooterProps {
  onNavigateToDesignSystem?: () => void;
  onNavigateToCookiePolicy?: () => void;
}

export function Footer({ onNavigateToDesignSystem, onNavigateToCookiePolicy }: FooterProps) {
  const footerLinks = {
    about: [
      { label: "How it works", to: "/how-it-works" },
      { label: "Our story", to: "/our-story" },
      { label: "Careers", to: "/careers" },
      { label: "Press", to: "/press" }
    ],
    support: [
      { label: "Help Center", to: "/help" },
      { label: "Safety", to: "/safety" },
      { label: "Contact Us", to: "/contact" },
      { label: "Trust & Safety", to: "/safety" }
    ],
    professionals: [
      { label: "Become a Pro", to: "/dashboard" },
      { label: "Resources", to: "/resources" },
      { label: "Community", to: "/community" },
      { label: "Pro Benefits", to: "/pro-benefits" }
    ],
    legal: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
      { label: "Sitemap", to: "/sitemap" },
      { label: "Accessibility", to: "/accessibility" }
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="border-t bg-gradient-to-b from-white to-[var(--blue-50)] mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6 mb-12">
          <div className="col-span-2">
            <motion.div 
              className="mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src={logoImage} 
                alt="photorido" 
                className="h-8 w-auto object-contain"
              />
            </motion.div>
            <p className="text-sm text-[var(--muted-foreground)] mb-6 max-w-xs">
              Connect with world-class creative professionals for all your photography and design needs.
            </p>
            
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--blue-100)] text-[var(--blue-600)] hover:bg-[var(--blue-600)] hover:text-white transition-all"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm text-[var(--primary)]">About</h4>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('#') ? (
                    <motion.a
                      href={link.to}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors"
                      whileHover={{ x: 4 }}
                      onClick={link.onClick}
                    >
                      {link.label}
                    </motion.a>
                  ) : (
                    <Link to={link.to}>
                      <motion.span
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors inline-block"
                        whileHover={{ x: 4 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm text-[var(--primary)]">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  {link.to.startsWith('#') ? (
                    <motion.a
                      href={link.to}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.a>
                  ) : (
                    <Link to={link.to}>
                      <motion.span
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors inline-block"
                        whileHover={{ x: 4 }}
                      >
                        {link.label}
                      </motion.span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm text-[var(--primary)]">Professionals</h4>
            <ul className="space-y-3">
              {footerLinks.professionals.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>
                    <motion.span
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors inline-block"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm text-[var(--primary)]">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link to={link.to}>
                    <motion.span
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors inline-block"
                      whileHover={{ x: 4 }}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <motion.div 
          className="mb-12 rounded-3xl bg-gradient-to-r from-[var(--blue-600)] to-[var(--blue-700)] p-8 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl mb-2">Stay Updated</h3>
              <p className="text-blue-100">Get the latest updates on new professionals and features</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="flex-1 md:w-64 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--blue-300)]" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
              </div>
              <motion.button
                className="px-6 h-12 bg-white text-[var(--blue-600)] rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)] text-center md:text-left">
            © 2025 photorido. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors">
              Terms of Service
            </a>
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                onNavigateToCookiePolicy?.();
              }}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--blue-600)] transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
