'use client';

import { useEffect, useState } from 'react';
import { Zap, Clock, TrendingUp } from 'lucide-react';
import { api, Product } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import CountdownTimer from '@/components/CountdownTimer';

interface FlashSaleProduct extends Product {
  flash_sale_price: number | null;
  flash_sale_start: string | null;
  flash_sale_end: string | null;
}

export default function FlashSalesPage() {
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [earliestEndTime, setEarliestEndTime] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products/flash-sales', {
        params: { skip: 0, limit: 20 },
      });

      const flashProducts = response.data.products || [];
      setProducts(flashProducts);

      // Find earliest end time for main countdown
      if (flashProducts.length > 0) {
        const endTimes = flashProducts
          .filter((p: FlashSaleProduct) => p.flash_sale_end)
          .map((p: FlashSaleProduct) => new Date(p.flash_sale_end!).getTime());

        if (endTimes.length > 0) {
          const earliest = new Date(Math.min(...endTimes)).toISOString();
          setEarliestEndTime(earliest);
        }
      }
    } catch (error) {
      console.error('Failed to fetch flash sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashSales();
  }, [refreshKey]);

  const handleTimerExpire = () => {
    // Refresh products when timer expires
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-orange-500 to-red-600">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="text-center space-y-6">
            {/* Icon and Title */}
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Zap className="w-8 h-8 md:w-12 md:h-12 text-yellow-300" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                Flash Sale
              </h1>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Zap className="w-8 h-8 md:w-12 md:h-12 text-yellow-300" />
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              🔥 Limited time deals! Grab amazing discounts before they expire!
            </p>

            {/* Main Countdown Timer */}
            {earliestEndTime && (
              <div className="space-y-3">
                <p className="text-white/80 font-medium">Deals End In:</p>
                <div className="flex justify-center">
                  <CountdownTimer
                    endTime={earliestEndTime}
                    onExpire={handleTimerExpire}
                    size="large"
                  />
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-white/90">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Up to 70% OFF</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Limited Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration at Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 0L60 10C120 20 240 40 360 53.3C480 67 600 73 720 73.3C840 73 960 67 1080 53.3C1200 40 1320 20 1380 10L1440 0V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z"
              fill="#F9FAFB"
            />
          </svg>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            🔥 Today's Flash Deals
          </h2>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="font-medium">While stocks last!</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <Zap className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Flash Sales Right Now
            </h3>
            <p className="text-gray-600 mb-6">
              Check back later for amazing deals!
            </p>
            <button
              onClick={() => window.location.href = '/products'}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Browse All Products
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <FlashSaleProductCard
                key={product.id}
                product={product}
                onExpire={() => setRefreshKey((prev) => prev + 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Lightning Deals</h3>
                <p className="text-sm text-gray-600">Up to 70% off on selected items</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Limited Time</h3>
                <p className="text-sm text-gray-600">Deals end when timer hits zero</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Best Prices</h3>
                <p className="text-sm text-gray-600">Lowest prices guaranteed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Flash Sale Product Card with Badge and Timer
function FlashSaleProductCard({
  product,
  onExpire,
}: {
  product: FlashSaleProduct;
  onExpire?: () => void;
}) {
  const discount = product.compare_price
    ? Math.round(
        ((product.compare_price - (product.flash_sale_price || product.price)) /
          product.compare_price) *
          100
      )
    : 0;

  const flashSaleEnd = product.flash_sale_end;

  return (
    <div className="relative group">
      {/* FLASH Badge */}
      <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-red-600 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
        <Zap className="w-3 h-3" />
        FLASH
      </div>

      {/* Product Card */}
      <ProductCard product={product} />

      {/* Countdown Timer Overlay */}
      {flashSaleEnd && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-3 pt-8">
          <div className="flex justify-center">
            <CountdownTimer endTime={flashSaleEnd} onExpire={onExpire} size="small" />
          </div>
        </div>
      )}

      {/* Discount Badge (if not already shown by ProductCard) */}
      {discount > 0 && (
        <div className="absolute top-2 right-2 z-20 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
          -{discount}%
        </div>
      )}
    </div>
  );
}
