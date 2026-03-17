'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlistStore, useAuthStore, useCartStore } from '@/store';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { wishlist, fetchWishlist, removeFromWishlist, moveToCart, isInWishlist } = useWishlistStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/wishlist');
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, fetchWishlist]);

  const handleMoveToCart = async (itemId: number) => {
    try {
      await moveToCart(itemId);
      await useCartStore.getState().fetchCart();
    } catch (error) {
      console.error('Failed to move to cart:', error);
    }
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const items = wishlist?.items || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <Heart className="w-8 h-8" />
        My Wishlist
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <Heart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Save products you love by clicking the heart icon
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Browse Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-6">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <Link href={`/products/${item.product.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={item.product.images?.[0] || 'https://via.placeholder.com/400x400'}
                      alt={item.product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  {/* Categories */}
                  {item.product.categories && item.product.categories.length > 0 && (
                    <p className="text-xs text-gray-500 mb-1">
                      {item.product.categories[0].name}
                    </p>
                  )}

                  {/* Name */}
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold hover:text-primary line-clamp-2 mb-2"
                  >
                    {item.product.name}
                  </Link>

                  {/* Price */}
                  <p className="text-lg font-bold text-primary mb-4">
                    {formatPrice(item.product.price)}
                  </p>

                  {/* Stock Status */}
                  <p className={cn(
                    "text-sm mb-4",
                    item.product.stock_quantity > 0 ? "text-green-600" : "text-red-500"
                  )}>
                    {item.product.stock_quantity > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.product_id)}
                      disabled={item.product.stock_quantity === 0}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                        item.product.stock_quantity === 0
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-primary text-white hover:bg-primary/90"
                      )}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={async () => {
                for (const item of items) {
                  if (item.product.stock_quantity > 0) {
                    await handleMoveToCart(item.id);
                  }
                }
              }}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Add All to Cart
            </button>
            <Link
              href="/products"
              className="px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
