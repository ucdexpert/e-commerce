'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/lib/api';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { cn, formatPrice } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      router.push(`/login?redirect=${pathname}`);
      toast.error('Cart mein add karne ke liye login karein');
      return;
    }

    // User is logged in - add to cart
    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} cart mein add ho gaya!`);
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.detail;
      
      if (status === 400 && msg?.includes('stock')) {
        toast.error('Yeh product stock mein nahi hai');
      } else if (status === 400) {
        toast.error(msg || 'Cart mein add nahi ho saka');
      } else {
        toast.error('Cart mein add nahi ho saka. Dobara try karein');
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    if (!user) {
      router.push(`/login?redirect=${pathname}`);
      toast.error('Save karne ke liye login karein');
      return;
    }

    try {
      if (inWishlist) {
        const item = useWishlistStore.getState().wishlist?.items.find(
          (i) => i.product_id === product.id
        );
        if (item) {
          await removeFromWishlist(item.id);
          toast.success('Wishlist se remove ho gaya');
        }
      } else {
        await addToWishlist(product.id);
        toast.success('Wishlist mein add ho gaya!');
      }
    } catch (error: any) {
      toast.error('Wishlist update nahi ho saka. Dobara try karein');
    }
  };

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const hasImage = product.images && product.images.length > 0 && product.images[0] && !imageError;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
                      card-hover h-full flex flex-col max-w-[280px] mx-auto">

        {/* Image Container - Fixed height max 192px */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              onError={() => setImageError(true)}
            />
          ) : (
            /* Beautiful Placeholder */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-white">
              <div className="text-4xl mb-2 opacity-90">
                {getCategoryEmoji(product.name)}
              </div>
              <p className="text-xs font-semibold text-center line-clamp-2 opacity-95 px-2">
                {product.name}
              </p>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_on_sale && discount > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                -{discount}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-secondary text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                FEATURED
              </span>
            )}
            {product.is_on_sale && discount <= 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg">
                SALE
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-all duration-200 shadow-md",
              "hover:scale-110 active:scale-90",
              inWishlist
                ? "bg-danger text-white"
                : "bg-white/90 text-gray-600 hover:bg-danger hover:text-white"
            )}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("w-4 h-4", inWishlist ? "fill-current" : "")} />
          </button>

          {/* Quick Add to Cart - Appears on hover */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock_quantity === 0}
            className={cn(
              "absolute bottom-2 left-2 right-2 py-2 px-3 rounded-lg font-semibold text-xs",
              "transition-all duration-300 transform shadow-lg",
              "flex items-center justify-center gap-1.5",
              product.stock_quantity === 0
                ? "bg-gray-400 cursor-not-allowed opacity-0"
                : "bg-white text-primary hover:bg-primary hover:text-white",
              "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            )}
          >
            {isAdding ? (
              'Adding...'
            ) : product.stock_quantity === 0 ? (
              'Out of Stock'
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                Add to Cart
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-3 flex flex-col flex-1">
          {/* Category */}
          {product.categories && product.categories.length > 0 && (
            <p className="text-[10px] text-muted uppercase tracking-wide font-medium mb-1">
              {product.categories[0].name}
            </p>
          )}

          {/* Name - max 2 lines */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < Math.floor(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-[10px] text-muted">({product.review_count})</span>
            </div>
          )}

          {/* Price - Pushed to bottom */}
          <div className="mt-auto flex items-baseline gap-1.5">
            <span className={cn(
              "text-base font-bold",
              product.is_on_sale ? "text-danger" : "text-primary"
            )}>
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-xs text-muted line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Helper function to get emoji based on product name
function getCategoryEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  const emojiMap: Record<string, string> = {
    phone: '📱',
    mobile: '📱',
    laptop: '💻',
    computer: '💻',
    shirt: '👕',
    clothing: '👕',
    shoe: '👟',
    watch: '⌚',
    headphone: '🎧',
    camera: '📷',
    book: '📚',
    toy: '🧸',
    game: '🎮',
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lowerName.includes(key)) {
      return emoji;
    }
  }
  return '📦';
}
