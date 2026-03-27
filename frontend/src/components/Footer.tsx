'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Heart, Loader2, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Newsletter state
  const [footerEmail, setFooterEmail] = useState('');
  const [footerLoading, setFooterLoading] = useState(false);
  const [footerSubscribed, setFooterSubscribed] = useState(false);

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!footerEmail || !footerEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setFooterLoading(true);
    
    try {
      const response = await axios.post(
        `${API_URL}/newsletter/subscribe`,
        null,
        {
          params: {
            email: footerEmail,
            source: 'footer'
          }
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        setFooterSubscribed(true);
        setFooterEmail('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to subscribe. Please try again.');
    } finally {
      setFooterLoading(false);
    }
  };

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
                C
              </div>
              <span className="text-xl md:text-2xl font-bold text-white">CartHub</span>
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
              <FooterLink href="/track" label="Track Order" />
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
              <FooterLink href="/track" label="Track Order" />
              <FooterLink href="/wishlist" label="Wishlist" />
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div>
            <h4 className="text-base md:text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-to-b from-primary to-secondary rounded-full" />
              Newsletter
            </h4>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to get special offers and updates
            </p>
            
            {footerSubscribed ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <p className="text-green-400 text-sm font-medium">Subscribed!</p>
                <p className="text-gray-400 text-xs mt-1">Check your inbox for offers</p>
              </div>
            ) : (
              <form onSubmit={handleFooterSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3 py-2.5 rounded-lg bg-gray-800 border border-gray-700 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-primary focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={footerLoading}
                  className="w-full px-4 py-2.5 bg-primary text-white font-medium rounded-lg
                           hover:bg-primary/90 transition-all duration-200 text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {footerLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              By subscribing, you agree to our Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {currentYear} CartHub. All rights reserved.
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
              Crafted by<Heart className="w-3 h-3 text-danger fill-danger" /> Muhammad Uzair
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
