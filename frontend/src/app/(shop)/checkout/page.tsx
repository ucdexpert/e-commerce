'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useCartStore } from '@/store';
import { addressesApi, ordersApi, Address, OrderCreateData } from '@/lib/api';
import { CreditCard, Truck, CheckCircle, Tag, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';

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

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<Address>();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }

    fetchCart();
    fetchAddresses();
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

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please shipping address select karein');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData: OrderCreateData = {
        shipping_address_id: selectedAddress,
        billing_address_id: selectedAddress,
        payment_method: paymentMethod,
        notes: notes || undefined,
        coupon_code: appliedCoupon?.code || undefined,
      };

      const response = await ordersApi.create(orderData);

      // Clear coupon after order is placed
      if (appliedCoupon) {
        setAppliedCoupon(null);
      }

      await clearCart();
      toast.success('Order place ho gaya! 🎉');
      router.push(`/orders/${response.data.id}?success=true`);
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

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

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
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="text-primary hover:underline text-sm"
              >
                {showAddressForm ? 'Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showAddressForm ? (
              <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                <div className="grid grid-cols-3 gap-4">
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
                <span>Credit Card (Stripe)</span>
              </label>
              <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
            </div>
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
              onClick={handlePlaceOrder}
              disabled={isProcessing || !selectedAddress}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
