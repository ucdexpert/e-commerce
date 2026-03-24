'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface JazzCashPaymentProps {
  amount: number;
  orderId: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function JazzCashPaymentForm({ amount, orderId, onSuccess, onError }: JazzCashPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhoneNumber = (number: string): boolean => {
    // Remove spaces and dashes
    const clean = number.replace(/[-\s]/g, '');
    
    // Check if it's a valid Pakistani phone number
    // Formats: 0300-1234567, 03001234567, +923001234567, 923001234567
    const pkPhoneRegex = /^(\+92|92)?0?3[0-9]{9}$/;
    
    if (!pkPhoneRegex.test(clean)) {
      return false;
    }
    return true;
  };

  const formatPhoneNumber = (number: string): string => {
    let clean = number.replace(/[-\s]/g, '');
    
    // Remove + if present
    if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    
    // Convert to international format
    if (clean.startsWith('03')) {
      clean = '92' + clean.substring(1);
    }
    
    return clean;
  };

  const handlePayment = async () => {
    // Validate phone number
    if (!phoneNumber.trim()) {
      setPhoneError('Mobile number zaroori hai');
      toast.error('Mobile number darj karein');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Invalid mobile number. Format: 0300-1234567');
      toast.error('Sahih mobile number darj karein (e.g., 0300-1234567)');
      return;
    }

    setPhoneError('');
    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');

      const formattedPhone = formatPhoneNumber(phoneNumber);

      const response = await fetch(`${API_URL}/jazzcash/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          order_id: orderId,
          phone_number: formattedPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Payment initiation failed');
      }

      toast.success('JazzCash redirect ho raha hai...');
      
      // Redirect to JazzCash payment page
      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        throw new Error('No redirect URL received');
      }
    } catch (error: any) {
      console.error('JazzCash payment error:', error);
      toast.error(error.message || 'Payment initiation failed. Please try again.');
      onError(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* JazzCash Branding */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="w-6 h-6" />
          <h3 className="text-lg font-bold">JazzCash Payment</h3>
        </div>
        <p className="text-sm text-red-100">
          Pay securely with your JazzCash mobile wallet
        </p>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          JazzCash Mobile Number
        </label>
        <div className="relative">
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => {
              setPhoneNumber(e.target.value);
              setPhoneError('');
            }}
            placeholder="0300-1234567"
            className={`w-full px-4 py-3 pl-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
              phoneError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        {phoneError && (
          <p className="mt-1 text-sm text-red-600">{phoneError}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          💡 Format: 0300-1234567 or +923001234567
        </p>
      </div>

      {/* Payment Amount */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Payment Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            Rs. {amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Lock className="w-4 h-4 text-green-600" />
        <span>Secure payment processed by JazzCash</span>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg
          hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center justify-center gap-2
          shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Smartphone className="w-5 h-5" />
            Pay Rs. {amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">How it works:</p>
        <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
          <li>Enter your JazzCash mobile number</li>
          <li>Click &quot;Pay&quot; to proceed</li>
          <li>You&apos;ll be redirected to JazzCash secure page</li>
          <li>Enter your JazzCash PIN to complete payment</li>
          <li>You&apos;ll receive a confirmation SMS</li>
        </ol>
      </div>
    </div>
  );
}
