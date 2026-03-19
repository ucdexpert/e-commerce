'use client';

import { useState, ReactNode } from 'react';
import { ChevronDown, Package, RefreshCcw, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: ReactNode;
  items: FAQItem[];
}

const faqData: FAQSection[] = [
  {
    title: 'Orders & Shipping',
    icon: <Package className="w-6 h-6" />,
    items: [
      {
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 3-5 business days. Express delivery takes 1-2 business days. Delivery times may vary during peak seasons or for remote locations.',
      },
      {
        question: 'How do I track my order?',
        answer: 'Go to "My Orders" section in your account and click on your order to see real-time status updates. You\'ll also receive email notifications at each stage of delivery.',
      },
      {
        question: 'Can I change my order after placing it?',
        answer: 'Orders can be modified within 1 hour of placing. Contact us immediately at support@eshop.com or call +92-300-1234567. After 1 hour, the order enters processing and cannot be changed.',
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer free standard shipping on all orders over $100. For orders under $100, a flat shipping fee of $10 applies.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    icon: <RefreshCcw className="w-6 h-6" />,
    items: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days of delivery for unused items in original packaging with tags attached. Items must be in resalable condition.',
      },
      {
        question: 'How do I request a return?',
        answer: 'Go to "My Orders", select the order and click "Request Return" button. Choose your reason and submit. We\'ll provide a prepaid return label via email.',
      },
      {
        question: 'When will I get my refund?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The refund will be credited to your original payment method.',
      },
      {
        question: 'Who pays for return shipping?',
        answer: 'For defective or wrong items, we cover return shipping. For change-of-mind returns, customer pays return shipping. Return shipping fee is $10.',
      },
    ],
  },
  {
    title: 'Payments',
    icon: <CreditCard className="w-6 h-6" />,
    items: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major Credit/Debit cards (Visa, MasterCard, American Express) via Stripe, and Cash on Delivery (COD) for select locations.',
      },
      {
        question: 'Is my payment information secure?',
        answer: 'Yes! All payments are encrypted and processed by Stripe, a PCI-DSS compliant payment processor. We never store your full card details.',
      },
      {
        question: 'Can I pay in installments?',
        answer: 'Currently we don\'t offer installment payments. However, we\'re working on integrating Buy Now Pay Later options soon.',
      },
      {
        question: 'What if my payment fails?',
        answer: 'If payment fails, your order won\'t be placed. Check your card details and try again. If issues persist, contact your bank or try a different payment method.',
      },
    ],
  },
  {
    title: 'Account',
    icon: <User className="w-6 h-6" />,
    items: [
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email. We\'ll send you a secure link to reset your password. The link expires in 1 hour.',
      },
      {
        question: 'Can I have multiple delivery addresses?',
        answer: 'Yes! You can save multiple addresses in your profile. During checkout, simply select the address you want to use for that order.',
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact our support team at support@eshop.com with your account deletion request. Note that this action is permanent and cannot be undone.',
      },
      {
        question: 'Can I shop without an account?',
        answer: 'Yes! You can checkout as a guest. However, creating an account lets you track orders, save addresses, and access exclusive member benefits.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (sectionIndex: number, itemIndex: number) => {
    const key = `${sectionIndex}-${itemIndex}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to common questions about orders, shipping, returns, and more.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-4xl mx-auto space-y-8">
        {faqData.map((section, sectionIndex) => (
          <div
            key={sectionIndex}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="text-white">{section.icon}</div>
                <h2 className="text-xl font-bold text-white">{section.title}</h2>
              </div>
            </div>

            {/* FAQ Items */}
            <div className="divide-y divide-gray-100">
              {section.items.map((item, itemIndex) => {
                const isOpen = openItems[`${sectionIndex}-${itemIndex}`];
                return (
                  <div key={itemIndex}>
                    <button
                      onClick={() => toggleItem(sectionIndex, itemIndex)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300',
                          isOpen ? 'rotate-180' : ''
                        )}
                      />
                    </button>
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      )}
                    >
                      <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still Need Help */}
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 text-white/90">
            Our customer support team is here to help you with any questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="px-6 py-3 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="https://wa.me/923170219387"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
