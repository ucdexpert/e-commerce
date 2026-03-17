'use client';

import { useUIStore } from '@/store';
import { Product } from '@/lib/api';
import { X, History } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useState } from 'react';

export default function RecentlyViewed() {
  const { recentlyViewed, clearRecentlyViewed } = useUIStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!recentlyViewed || recentlyViewed.length === 0) {
    return null;
  }

  // Show max 6 products
  const displayedProducts = recentlyViewed.slice(0, 6);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recently Viewed</h2>
            <p className="text-sm text-gray-500">Your browsing history</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-sm text-primary hover:underline font-medium"
          >
            {isCollapsed ? 'Show' : 'Hide'}
          </button>
          <button
            onClick={clearRecentlyViewed}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-danger transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayedProducts.map((product) => (
            <RecentlyViewedCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecentlyViewedCard({ product }: { product: Product }) {
  const hasImage = product.images && product.images.length > 0 && product.images[0];
  
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600">
          {hasImage ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-3xl">
              📦
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold text-sm">
              {formatPrice(product.price)}
            </span>
            {product.compare_price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.compare_price)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
