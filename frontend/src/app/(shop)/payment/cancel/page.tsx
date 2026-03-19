'use client';

import Link from 'next/link';
import { XCircle, HelpCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg">
            <XCircle className="w-14 h-14 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Payment Cancelled
          </h1>
          
          <p className="text-gray-600 text-lg">
            Your payment was not completed
          </p>
        </div>

        {/* Message */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Don't Worry, Your Cart is Saved!
              </h3>
              <p className="text-sm text-gray-600">
                Your items are still in your cart. You can complete your purchase 
                anytime. If you have any questions, our support team is here to help.
              </p>
            </div>
          </div>
        </div>

        {/* Common Reasons */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Common Reasons for Payment Failure:</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Insufficient funds in your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Incorrect card details entered</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Card expired or invalid</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Transaction declined by your bank</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>Network or connectivity issues</span>
            </li>
          </ul>
        </div>

        {/* What to Do */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">What You Can Do:</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
              <span>Check your card details and try again</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
              <span>Contact your bank if the issue persists</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
              <span>Try a different payment method</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">4</span>
              <span>Choose Cash on Delivery (COD) option</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/cart"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <ShoppingCart className="w-5 h-5" />
            Back to Cart
          </Link>
          
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Having trouble? Our support team is here to help
          </p>
          <a
            href="mailto:support@eshop.com"
            className="text-blue-600 font-semibold hover:underline"
          >
            support@eshop.com
          </a>
          <p className="text-xs text-gray-500 mt-2">
            Or use the live chat button in the bottom right corner
          </p>
        </div>
      </div>
    </div>
  );
}
