'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuthStore, useCartStore } from '@/store';
import { addressesApi, ordersApi, Address, OrderCreateData } from '@/lib/api';
import { CreditCard, Truck, CheckCircle, Tag, X, Smartphone } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import StripePaymentForm from '@/components/StripePaymentForm';
import JazzCashPaymentForm from '@/components/JazzCashPaymentForm';
import EasyPaisaPaymentForm from '@/components/EasyPaisaPaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_publishable_key'
);

// Debug: Log Stripe key (remove in production)
if (typeof window !== 'undefined') {
  const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  console.log('Stripe Key loaded:', stripeKey ? `${stripeKey.substring(0, 15)}...` : 'NOT LOADED');
  if (!stripeKey || stripeKey.includes('YOUR_')) {
    console.error('⚠️ Stripe key not configured! Check .env.local file');
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { cart, fetchCart, clearCart } = useCartStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Guest checkout state
  const [guestEmail, setGuestEmail] = useState('');
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'login' | null>(null);
  const [guestOrderPlaced, setGuestOrderPlaced] = useState(false);

  // Stripe payment state
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [stripePaymentReady, setStripePaymentReady] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Address>();

  useEffect(() => {
    fetchCart();
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated, fetchCart]);

  const fetchAddresses = async () => {
    try {
      const response = await addressesApi.getAll();
      setAddresses(response.data);
      if (response.data.length > 0) {
        const defaultAddr = response.data.find((a: Address) => a.is_default) || response.data[0];
        setSelectedAddress(defaultAddr.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const items = cart?.items || [];

  const subtotal = items.reduce((sum: number, item: any) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + shipping + tax - discount;

  // Validate coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    setCouponMessage('');
    setCouponError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await axios.post(`${API_URL}/admin/coupons/validate`, {
        code: couponCode.trim(),
        order_total: subtotal,
      });

      const { valid, discount, message } = response.data;

      if (valid) {
        setAppliedCoupon({ code: couponCode.trim(), discount });
        setCouponMessage(message);
      } else {
        setAppliedCoupon(null);
        setCouponError(message);
      }
    } catch (error: any) {
      setCouponError('Failed to validate coupon. Please try again.');
      console.error('Coupon validation error:', error);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponMessage('');
    setCouponError('');
  };

  const onSubmitAddress = async (data: Address) => {
    try {
      const response = await addressesApi.create(data);
      setAddresses([...addresses, response.data]);
      setSelectedAddress(response.data.id);
      setShowAddressForm(false);
      reset();
      toast.success('Address add ho gaya!');
    } catch (error: any) {
      const msg = error.response?.data?.detail;
      toast.error(msg || 'Address add nahi ho saka. Dobara try karein');
    }
  };

  const handlePlaceOrder = async (stripePaymentIntentId?: string) => {
    // CRITICAL: Validate Stripe payment is complete before creating order
    if (paymentMethod === 'stripe' && !stripePaymentIntentId && !paymentIntentId) {
      toast.error('Please complete card payment first');
      return;
    }

    if (!selectedAddress && !checkoutMode) {
      toast.error('Please select checkout mode');
      return;
    }

    if (checkoutMode === 'guest' && !guestEmail) {
      toast.error('Please enter your email for order confirmation');
      return;
    }

    if (!selectedAddress) {
      toast.error('Please shipping address select karein');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: any = {
        shipping_address_id: selectedAddress,
        billing_address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: notes || undefined,
        coupon_code: appliedCoupon?.code || undefined,
      };

      // Add guest email if guest checkout
      if (checkoutMode === 'guest') {
        orderData.guest_email = guestEmail;
      }

      // Add Stripe payment intent ID if available
      const finalPaymentIntentId = stripePaymentIntentId || paymentIntentId;
      if (paymentMethod === 'stripe' && finalPaymentIntentId) {
        orderData.stripe_payment_id = finalPaymentIntentId;
        orderData.payment_status = 'paid';
      }

      const response = await ordersApi.create(orderData);
      const orderId = response.data.id;

      // Store order ID for Stripe payment
      setCreatedOrderId(orderId);
      setOrderCreated(true);
      setGuestOrderPlaced(true);

      // Clear coupon after order is placed
      if (appliedCoupon) {
        setAppliedCoupon(null);
      }

      // If COD, complete immediately
      if (paymentMethod === 'cod') {
        await clearCart();
        toast.success('Order place ho gaya! 🎉');
        router.push(`/payment/success?order_id=${orderId}&guest=true`);
        return;
      }

      // If Stripe, confirm payment with backend
      if (paymentMethod === 'stripe' && finalPaymentIntentId) {
        // Confirm payment with backend
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const token = localStorage.getItem('access_token');

        const headers: any = {
          'Content-Type': 'application/json',
        };

        // Add auth header only if logged in
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        await fetch(`${API_URL}/orders/confirm-payment/${orderId}`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            payment_intent_id: finalPaymentIntentId,
          }),
        });

        await clearCart();
        toast.success('Payment successful! Order placed! 🎉');
        router.push(`/payment/success?order_id=${orderId}&guest=true`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.detail;
      const status = error.response?.status;

      if (status === 400 && msg?.includes('stock')) {
        toast.error('Kuch products stock mein nahi hain');
      } else if (status === 400 && msg?.includes('coupon')) {
        toast.error('Coupon code valid nahi hai');
      } else if (status === 400) {
        toast.error(msg || 'Order place nahi ho saka');
      } else if (status === 401) {
        toast.error('Please pehle login karein');
        router.push('/login');
      } else {
        toast.error('Order place nahi ho saka. Dobara try karein');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle successful Stripe payment
  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    setPaymentIntentId(paymentIntentId);
    setStripePaymentReady(true);
    await handlePlaceOrder(paymentIntentId);
  };

  // Handle Stripe payment error
  const handleStripePaymentError = (error: string) => {
    console.error('Stripe payment error:', error);
    setOrderCreated(false);
  };

  // If cart is empty, show message
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Checkout Mode Selection for Non-Authenticated Users */}
      {!isAuthenticated && !guestOrderPlaced && (
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-4">
              How would you like to checkout?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => router.push('/login?redirect=/checkout')}
                className="border-2 border-blue-600 text-blue-600 p-4 rounded-xl hover:bg-blue-50 text-left transition-all"
              >
                <div className="font-semibold text-base">👤 Login / Register</div>
                <div className="text-sm text-gray-500 mt-1">
                  Track orders, faster checkout, save addresses
                </div>
              </button>
              
              <button
                onClick={() => setCheckoutMode('guest')}
                className={`border-2 p-4 rounded-xl text-left transition-all ${
                  checkoutMode === 'guest'
                    ? 'border-green-600 bg-green-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold text-base">🛒 Guest Checkout</div>
                <div className="text-sm text-gray-500 mt-1">
                  Quick checkout without creating an account
                </div>
              </button>
            </div>
            
            {checkoutMode === 'guest' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📧 Email for order confirmation
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={e => setGuestEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">
                  We'll send your order confirmation to this email address
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Truck className="w-6 h-6" />
                Shipping Address
              </h2>
              {!isAuthenticated && checkoutMode !== 'guest' && (
                <span className="text-sm text-gray-500">Select checkout mode above</span>
              )}
              {isAuthenticated && (
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-primary hover:underline text-sm"
                >
                  {showAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              )}
            </div>

            {isAuthenticated ? (
              // Authenticated user - show saved addresses
              showAddressForm ? (
                <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">First Name</label>
                      <input
                        {...register('first_name', { required: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Last Name</label>
                      <input
                        {...register('last_name', { required: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Address</label>
                    <input
                      {...register('address_line1', { required: true })}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">City</label>
                      <input
                        {...register('city', { required: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">State</label>
                      <input
                        {...register('state', { required: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Postal Code</label>
                      <input
                        {...register('postal_code', { required: true })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <input
                      {...register('country', { required: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      {...register('phone', { required: true })}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Save Address
                  </button>
                </form>
              ) : addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer ${
                        selectedAddress === addr.id ? 'border-primary bg-primary/5' : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium">
                          {addr.first_name} {addr.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {addr.address_line1}, {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                        <p className="text-sm text-gray-600">{addr.country}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No addresses saved. Please add a new address.</p>
              )
            ) : checkoutMode === 'guest' ? (
              // Guest checkout - show address form directly
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                      type="text"
                      onChange={(e) => {/* Handle guest first name */}}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                      type="text"
                      onChange={(e) => {/* Handle guest last name */}}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="Street address"
                    onChange={(e) => {/* Handle guest address */}}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">City</label>
                    <input
                      type="text"
                      onChange={(e) => {/* Handle guest city */}}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">State</label>
                    <input
                      type="text"
                      onChange={(e) => {/* Handle guest state */}}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      onChange={(e) => {/* Handle guest postal code */}}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    onChange={(e) => {/* Handle guest country */}}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    onChange={(e) => {/* Handle guest phone */}}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  ℹ️ You'll enter your complete address during order placement
                </p>
              </form>
            ) : (
              <p className="text-gray-500">Please select a checkout mode above to continue.</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6" />
              Payment Method
            </h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <span className="font-medium">Credit/Debit Card (Stripe)</span>
                  <p className="text-xs text-gray-500">Visa, Mastercard, American Express</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="jazzcash"
                  checked={paymentMethod === 'jazzcash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Smartphone className="w-5 h-5 text-red-600" />
                <div>
                  <span className="font-medium">JazzCash</span>
                  <p className="text-xs text-gray-500">Mobile Wallet Payment</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="easypaisa"
                  checked={paymentMethod === 'easypaisa'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Smartphone className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium">EasyPaisa</span>
                  <p className="text-xs text-gray-500">Mobile Wallet Payment</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <Truck className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="font-medium">Cash on Delivery</span>
                  <p className="text-xs text-gray-500">Pay when you receive your order</p>
                </div>
              </label>
            </div>

            {/* Stripe Payment Form */}
            {paymentMethod === 'stripe' && (
              <div className="mt-6 pt-6 border-t">
                {/* Important Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 font-medium">
                    ⚠️ Important: You must complete card payment first before placing order.
                  </p>
                  <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Enter your card details below</li>
                    <li>Click &quot;Pay ${total.toFixed(2)}&quot; to process payment</li>
                    <li>Once payment succeeds, order will be placed automatically</li>
                  </ol>
                </div>

                <h3 className="text-lg font-semibold mb-4">Enter Card Details:</h3>

                {/* Card Input */}
                <div className="bg-white border border-gray-300 rounded-xl p-4 mb-4">
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      amount={total}
                      onSuccess={handleStripePaymentSuccess}
                      onError={handleStripePaymentError}
                    />
                  </Elements>
                </div>

                {/* Test Cards Info */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-800 mb-2">
                    🧪 Test Card Numbers (Demo Mode):
                  </p>
                  <div className="space-y-1 text-xs text-blue-700">
                    <p>✅ <strong>Success:</strong> 4242 4242 4242 4242</p>
                    <p>❌ <strong>Decline:</strong> 4000 0000 0000 0002</p>
                    <p>📅 <strong>Expiry:</strong> Any future date (e.g., 12/30)</p>
                    <p>🔢 <strong>CVV:</strong> Any 3 digits (e.g., 123)</p>
                    <p>📮 <strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                  🔒 Your payment information is secure and encrypted with Stripe
                </p>
              </div>
            )}

            {/* JazzCash Payment Form */}
            {paymentMethod === 'jazzcash' && (
              <div className="mt-6 pt-6 border-t">
                <JazzCashPaymentForm
                  amount={total}
                  orderId={createdOrderId || 0}
                  onSuccess={() => {
                    toast.success('Payment successful! Redirecting...');
                    if (createdOrderId) {
                      router.push(`/payment/success?order_id=${createdOrderId}&guest=true`);
                    }
                  }}
                  onError={(error) => {
                    console.error('JazzCash payment error:', error);
                  }}
                />
              </div>
            )}

            {/* EasyPaisa Payment Form */}
            {paymentMethod === 'easypaisa' && (
              <div className="mt-6 pt-6 border-t">
                <EasyPaisaPaymentForm
                  amount={total}
                  orderId={createdOrderId || 0}
                  onSuccess={() => {
                    toast.success('Payment successful! Redirecting...');
                    if (createdOrderId) {
                      router.push(`/payment/success?order_id=${createdOrderId}&guest=true`);
                    }
                  }}
                  onError={(error) => {
                    console.error('EasyPaisa payment error:', error);
                  }}
                />
              </div>
            )}
          </div>

          {/* Order Notes */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="text-xl font-bold mb-4">Order Notes (Optional)</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions for your order?"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl border sticky top-24">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item: any) => (
                <div key={item.id || item.product_id} className="flex gap-3">
                  <img
                    src={item.product?.images?.[0] || 'https://via.placeholder.com/60x60'}
                    alt={item.product?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product?.name || 'Product'}
                    </p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                    <p className="text-primary font-semibold text-sm">
                      {formatPrice((item.product?.price || 0) * (item.quantity || 1))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code */}
            <div className="border-t pt-4 mb-4">
              <label className="block text-sm font-medium mb-2">Have a coupon?</label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">{appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 hover:bg-green-100 rounded"
                  >
                    <X className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                    disabled={validatingCoupon}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {validatingCoupon ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              )}
              {couponMessage && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  {couponMessage}
                </p>
              )}
              {couponError && (
                <p className="mt-2 text-sm text-red-600">{couponError}</p>
              )}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(tax)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => handlePlaceOrder()}
              disabled={
                isProcessing || 
                !selectedAddress || 
                (paymentMethod === 'stripe' && (!stripePaymentReady || orderCreated))
              }
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'stripe' && !stripePaymentReady ? (
                <>
                  <span>💳 Complete Payment First</span>
                </>
              ) : paymentMethod === 'stripe' && orderCreated ? (
                <>
                  <span>✅ Payment Complete - Order Placed</span>
                </>
              ) : (
                <>
                  <span>📦 Place Order</span>
                  {paymentMethod === 'cod' && <span>(COD)</span>}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
