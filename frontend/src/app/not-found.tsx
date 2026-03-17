'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Package } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8 relative">
          <div className="w-64 h-64 mx-auto bg-white rounded-full shadow-xl flex items-center justify-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-4 left-4 w-16 h-16 bg-blue-100 rounded-full opacity-50" />
            <div className="absolute bottom-4 right-4 w-20 h-20 bg-indigo-100 rounded-full opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-100 rounded-full opacity-30" />
            
            {/* Package icon */}
            <Package className="w-32 h-32 text-primary relative z-10" />
          </div>
          
          {/* 404 Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
            <span className="text-[200px] font-bold text-gray-200 opacity-50">404</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for seems to have wandered off into the digital void. 
          Don't worry, we'll help you find your way back!
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Additional Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/products" className="text-primary hover:underline">
              Browse Products
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/contact" className="text-primary hover:underline">
              Contact Support
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="/faq" className="text-primary hover:underline">
              FAQ
            </Link>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-xs text-gray-400">
          Error Code: 404 | If this problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
