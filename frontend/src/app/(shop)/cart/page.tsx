'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, useAuthStore } from '@/store';
import RecentlyViewed from '@/components/RecentlyViewed';
import { Trash2, Plus, Minus, ShoppingCart as CartIcon, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { cart, fetchCart, updateCartItem, removeFromCart, clearCart } = useCartStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // If user is not logged in, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center py-20">
          <CartIcon className="mx-auto mb-4 text-gray-300" size={64} />
          <h2 className="text-2xl font-semibold mb-2">Login to view your cart</h2>
          <p className="text-gray-500 mb-6">
            Please login to add items and checkout
          </p>
          <Link
            href="/login?redirect=/cart"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors"
          >
            Login to Continue
          </Link>
          <p className="mt-4 text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item: any) => {
    const price = item.product?.price || 0;
    const quantity = item.quantity || 1;
    return sum + price * quantity;
  }, 0);

  const shipping = subtotal > 100 ? 0 : 10;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    await updateCartItem(itemId, quantity);
  };

  const handleRemove = async (itemId: number) => {
    await removeFromCart(itemId);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <CartIcon className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item: any) => (
              <div
                key={item.id || item.product_id}
                className="flex gap-4 p-4 bg-white rounded-xl border"
              >
                {/* Image */}
                <Link href={`/products/${item.product?.slug || '#'}`}>
                  <img
                    src={item.product?.images?.[0] || '/placeholder.svg'}
                    alt={item.product?.name || 'Product'}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== '/placeholder.svg') {
                        target.src = '/placeholder.svg';
                      }
                    }}
                  />
                </Link>

                {/* Details */}
                <div className="flex-1">
                  <Link
                    href={`/products/${item.product?.slug || '#'}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.product?.name || 'Product'}
                  </Link>

                  {/* Variant */}
                  {item.variant && Object.keys(item.variant).length > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {Object.entries(item.variant)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ')}
                    </p>
                  )}

                  {/* Price */}
                  <p className="text-primary font-bold mt-2">
                    {formatPrice(item.product?.price || 0)}
                  </p>
                </div>

                {/* Quantity */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => handleRemove(item.id || item.product_id)}
                    className="p-2 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>

                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id || item.product_id,
                          (item.quantity || 1) - 1
                        )
                      }
                      className="px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center font-medium">
                      {item.quantity || 1}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.id || item.product_id,
                          (item.quantity || 1) + 1
                        )
                      }
                      className="px-3 py-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-sm text-red-500 hover:underline"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (10%)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {shipping > 0 && (
                <p className="text-sm text-gray-500 mb-4">
                  Add {formatPrice(100 - subtotal)} more for free shipping!
                </p>
              )}

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="w-5 h-5" />
              </button>

              <Link
                href="/products"
                className="block text-center mt-4 text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewed />
    </div>
  );
}
