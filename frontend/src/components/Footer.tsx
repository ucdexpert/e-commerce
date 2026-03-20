import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {/* Company Info */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary
                              flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">E-Shop</span>
            </Link>
            <p className="text-sm md:text-base text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for quality products at amazing prices.
              We offer the best selection with unbeatable customer service.
            </p>

            {/* Social Media */}
            <div className="flex gap-3">
              <SocialLink href="https://www.facebook.com/uzairkhilji.uzairkhilji/" icon={<Facebook className="w-5 h-5" />} label="Facebook" />
              <SocialLink href="https://x.com/UzairKhilj60869" icon={<Twitter className="w-5 h-5" />} label="Twitter" />
              <SocialLink href="https://www.instagram.com/uzairkhilji.uzairkhilji/" icon={<Instagram className="w-5 h-5" />} label="Instagram" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/products" label="All Products" />
              <FooterLink href="/products?is_on_sale=true" label="Sale Items" />
              <FooterLink href="/products?is_featured=true" label="Featured" />
              <FooterLink href="/products?sort_by=rating&sort_order=desc" label="Best Sellers" />
              <FooterLink href="/orders" label="Track Order" />
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              Customer Service
            </h4>
            <ul className="space-y-3">
              <FooterLink href="/contact" label="Contact Us" />
              <FooterLink href="/faq" label="FAQ" />
              <FooterLink href="/faq#returns" label="Return Policy" />
              <FooterLink href="/profile" label="My Account" />
              <FooterLink href="/orders" label="Track Order" />
              <FooterLink href="/wishlist" label="Wishlist" />
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center
                              group-hover:bg-primary/20 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href="mailto:hassankhilji26@gmail.com" className="text-sm hover:text-primary transition-colors">
                    hassankhilji26@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center
                              group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                  <a href="tel:+923170219387" className="text-sm hover:text-primary transition-colors">
                    +92 317-0219387
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center
                              group-hover:bg-primary/20 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">WhatsApp</p>
                  <a href="https://wa.me/923170219387" className="text-sm hover:text-primary transition-colors">
                    +92 317-0219387
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center
                              group-hover:bg-primary/20 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Address</p>
                  <span className="text-sm">Karachi, Pakistan</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} E-Shop. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/faq#returns" className="text-sm text-gray-400 hover:text-white transition-colors">
                Return Policy
              </Link>
              <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                Contact Us
              </Link>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-danger fill-danger" /> for our customers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Social Link Component
interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function SocialLink({ href, icon, label }: SocialLinkProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gray-800 flex items-center justify-center
               text-gray-400 hover:bg-primary hover:text-white transition-all duration-200
               hover:scale-110 hover:shadow-lg hover:shadow-primary/30"
    >
      {icon}
    </a>
  );
}

// Footer Link Component
interface FooterLinkProps {
  href: string;
  label: string;
}

function FooterLink({ href, label }: FooterLinkProps) {
  return (
    <li>
      <Link
        href={href}
        className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 group"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-gray-600 group-hover:bg-primary transition-colors" />
        <span className="group-hover:translate-x-1 transition-transform">{label}</span>
      </Link>
    </li>
  );
}
