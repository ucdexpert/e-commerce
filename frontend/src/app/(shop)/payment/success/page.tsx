'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, Mail, ArrowRight, Sparkles } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [confetti, setConfetti] = useState(true);

  useEffect(() => {
    // Confetti animation
    const timer = setTimeout(() => setConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {confetti && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-20px',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Payment Successful!
            </h1>
            <Sparkles className="w-6 h-6 text-yellow-500" />
          </div>
          
          <p className="text-gray-600 text-lg">
            Your order has been placed successfully
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
          </div>
          
          {orderId && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-blue-600">#{orderId}</p>
            </div>
          )}
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold text-green-600">Paid</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-semibold">Credit Card</span>
            </div>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <Mail className="w-6 h-6 text-gray-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Confirmation Email Sent
              </h3>
              <p className="text-sm text-gray-600">
                We've sent a confirmation email to your registered email address. 
                Please check your inbox (and spam folder) for order updates and tracking information.
              </p>
            </div>
          </div>
        </div>

        {/* What's Next */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">1</span>
              </div>
              <p className="text-sm text-gray-600">
                We'll process your order within 1-2 business days
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">2</span>
              </div>
              <p className="text-sm text-gray-600">
                You'll receive a shipping confirmation with tracking number
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-sm">3</span>
              </div>
              <p className="text-sm text-gray-600">
                Your order will be delivered in 3-5 business days
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={orderId ? `/orders/${orderId}` : '/orders'}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <Package className="w-5 h-5" />
            View Order
          </Link>
          
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all active:scale-[0.98]"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Need help? Contact our support team
          </p>
          <a
            href="mailto:support@eshop.com"
            className="text-blue-600 font-semibold hover:underline"
          >
            support@eshop.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
