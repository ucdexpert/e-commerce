'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Loader2, Home, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function UnsubscribePage({
  searchParams
}: {
  searchParams: Promise<{ email?: string }>
}) {
  const params = use(searchParams);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const emailParam = params.email;
    
    if (!emailParam) {
      setMessage('No email address provided');
      setSuccess(false);
      setLoading(false);
      return;
    }

    setEmail(decodeURIComponent(emailParam));

    // Automatically process unsubscribe
    processUnsubscribe(decodeURIComponent(emailParam));
  }, [params.email]);

  const processUnsubscribe = async (emailAddress: string) => {
    try {
      setProcessing(true);
      const response = await axios.get(`${API_URL}/newsletter/unsubscribe`, {
        params: { email: emailAddress }
      });
      
      if (response.data.success) {
        setSuccess(true);
        setMessage(response.data.message);
      } else {
        setSuccess(false);
        setMessage('Failed to unsubscribe. Please try again.');
      }
    } catch (error: any) {
      setSuccess(false);
      setMessage(error.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
      setProcessing(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Back to Home Link */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {loading || processing ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Processing...
              </h1>
              <p className="text-gray-500 text-sm">
                Please wait while we process your request
              </p>
            </div>
          ) : success === true ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Unsubscribed Successfully
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              {email && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 mb-6">
                  <Mail className="w-4 h-4 inline mr-2" />
                  {email}
                </p>
              )}
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
                <Link
                  href="/products"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          ) : success === false ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Unsubscribe Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => email && processUnsubscribe(email)}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  href="/"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Back to Home
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Changed your mind?{' '}
            <Link href="/" className="text-blue-600 hover:underline font-medium">
              Subscribe again
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
