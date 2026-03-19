'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

interface StripePaymentFormProps {
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export default function StripePaymentForm({ amount, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handleStripePayment = async () => {
    // Validation 1: Check if Stripe is loaded
    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please refresh the page.');
      onError('Stripe not initialized');
      return;
    }

    // Validation 2: Check if card is complete
    if (!cardComplete) {
      toast.error('Please enter your card details');
      onError('Card details incomplete');
      return;
    }

    // Get card element
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast.error('Card input not found');
      onError('Card element not found');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create payment intent on backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${API_URL}/orders/create-payment-intent?amount=${amount}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Payment failed');
      }

      const { client_secret, payment_intent_id } = await response.json();

      // Step 2: Confirm card payment with Stripe
      const result = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer',
            email: token ? undefined : 'guest@example.com',
          },
        },
      });

      if (result.error) {
        // Payment failed
        toast.error(result.error.message || 'Payment failed!');
        onError(result.error.message || 'Payment failed');
        setLoading(false);
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Payment succeeded
        toast.success('Payment successful! 🎉');
        onSuccess(payment_intent_id);
        // Don't set loading to false here - let the parent handle redirect
      }
    } catch (error: any) {
      console.error('Stripe payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      onError(error.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Card Element */}
      <div className="border border-gray-300 rounded-xl p-4 bg-white shadow-sm">
        <div className="text-sm font-medium text-gray-700 mb-2">Card Information:</div>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#374151',
                '::placeholder': {
                  color: '#9CA3AF',
                },
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
              },
              invalid: {
                color: '#EF4444',
                iconColor: '#EF4444',
              },
            },
            hidePostalCode: true,
          }}
          onChange={(e) => {
            setCardComplete(e.complete ?? false);
            if (e.error) {
              toast.error(e.error.message);
            }
          }}
        />
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Lock className="w-4 h-4 text-green-600" />
        <span>Payments are secure and encrypted with Stripe</span>
      </div>

      {/* Pay Button with Loading State */}
      <button
        onClick={handleStripePayment}
        disabled={loading || !cardComplete || !stripe}
        className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-all duration-200 flex items-center justify-center gap-2
          shadow-lg hover:shadow-xl active:scale-[0.98]"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Pay ${amount.toFixed(2)}
          </>
        )}
      </button>

      {/* Card Icons */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span>💳</span>
          <span>Visa</span>
          <span>•</span>
          <span>Mastercard</span>
          <span>•</span>
          <span>Amex</span>
        </div>
      </div>
    </div>
  );
}
