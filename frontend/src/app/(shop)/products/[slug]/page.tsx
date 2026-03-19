'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi, Product, ReviewData } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import {
  ShoppingCart,
  Star,
  ChevronLeft,
  Heart,
  Truck,
  RotateCcw,
  Shield,
  Check,
  Minus,
  Plus,
  Zap,
  ArrowRight,
  Send,
  UserCircle,
  BadgeCheck,
  ZoomIn,
  Share2,
  MessageCircle
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Review interface
interface Review {
  id: number;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  verified_purchase: boolean;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const reviewsRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, any>>({});
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'reviews'>('description');
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Lightbox state for image zoom
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState<ReviewData>({ rating: 0, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { isAuthenticated, user } = useAuthStore();
  const { addToCart } = useCartStore();
  const { addToRecentlyViewed } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = product ? `Check out ${product.name}!` : 'Check out this product!';

  useEffect(() => {
    async function fetchProduct() {
      try {
        const response = await productsApi.getBySlug(slug);
        const productData = response.data;
        setProduct(productData);
        setActiveImage(0);

        // Add to recently viewed
        addToRecentlyViewed(productData);

        // Fetch related products
        const relatedRes = await productsApi.getRelated(productData.id, 4);
        setRelatedProducts(relatedRes.data.products || []);

        // Fetch reviews
        fetchReviews(productData.id);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  const fetchReviews = async (productId: number) => {
    try {
      // Note: API endpoint may vary based on your backend
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      // Set empty array if fetch fails
      setReviews([]);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    // Check if user is logged in
    if (!user) {
      router.push(`/login?redirect=/products/${product.slug}`);
      toast.error('Cart mein add karne ke liye login karein');
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity, Object.keys(selectedVariant).length ? selectedVariant : undefined);
      toast.success('Cart mein add ho gaya!');
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

  const handleBuyNow = async () => {
    // Check if user is logged in
    if (!user || !product) {
      toast.error('Please login karein');
      router.push('/login');
      return;
    }

    await handleAddToCart();
    router.push('/cart');
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      toast.error('Please login to write a review');
      router.push('/login');
      return;
    }
    setActiveTab('reviews');
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
    setShowReviewForm(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || newReview.rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmittingReview(true);
    try {
      await productsApi.addReview(product.id, newReview);
      toast.success('Review submitted!');
      setNewReview({ rating: 0, title: '', comment: '' });
      setShowReviewForm(false);
      fetchReviews(product.id);
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
          <div className="h-[450px] bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-12 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => router.push('/products')}
          className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const isLowStock = product.stock_quantity > 0 && product.stock_quantity < 5;
  const isOutOfStock = product.stock_quantity === 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>

        {/* Product Details - Main Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8">
            {/* Left: Image Gallery */}
            <div className="p-6 lg:p-8 bg-[#F8F9FA]">
              {/* Main Image - responsive height with zoom */}
              <div 
                className="w-full h-64 md:h-96 lg:h-[450px] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center p-4 mb-4 relative cursor-zoom-in group"
                onClick={() => {
                  setLightboxIndex(activeImage);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={product.images && product.images[activeImage] ? product.images[activeImage] : '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== '/placeholder.svg') {
                      target.src = '/placeholder.svg';
                    }
                  }}
                />
                {/* Zoom indicator overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 rounded-2xl pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
                    <ZoomIn className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* Discount Badge */}
              {product.is_on_sale && discount > 0 && (
                <span className="inline-block bg-danger text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg mb-4">
                  -{discount}% OFF
                </span>
              )}

              {product.images && product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={cn(
                        "w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                        activeImage === index
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-primary/50"
                      )}
                    >
                      <img
                        src={image || '/placeholder.svg'}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== '/placeholder.svg') {
                            target.src = '/placeholder.svg';
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Product Info */}
            <div className="p-6 lg:p-8 flex flex-col">
              {/* Category Badge */}
              {product.categories && product.categories.length > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 text-primary text-xs font-semibold px-3 py-1.5 rounded-full w-fit mb-4">
                  {product.categories[0].name}
                </span>
              )}

              {/* Product Name */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              {/* Share Buttons */}
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Share:</span>
                
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-green-600 transition shadow-sm"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
                
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-700 transition shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Facebook
                </a>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Copy Link
                </button>
              </div>

              {/* Rating Row */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-4 h-4",
                        star <= Math.round(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      )}
                    />
                  ))}
                </div>
                <span className="font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
                <span className="text-gray-500">({product.review_count} reviews)</span>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleWriteReview}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Write a review
                </button>
              </div>

              {/* Price Section */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={cn(
                    "text-3xl md:text-4xl font-bold",
                    product.is_on_sale ? "text-danger" : "text-primary"
                  )}>
                    {formatPrice(product.price)}
                  </span>
                  {product.compare_price && (
                    <>
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                      <span className="bg-danger text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock Urgency Indicator - IMPROVED */}
              <div className="mb-6 space-y-2">
                {product.stock_quantity === 0 && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 font-medium text-sm">
                      Out of Stock
                    </span>
                  </div>
                )}
                
                {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                  <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5">
                    <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                    <span className="text-orange-600 font-medium text-sm">
                      🔥 Only {product.stock_quantity} left in stock!
                    </span>
                  </div>
                )}
                
                {product.stock_quantity > 5 && product.stock_quantity <= 20 && (
                  <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    <span className="text-yellow-600 font-medium text-sm">
                      ⚡ Only {product.stock_quantity} items remaining
                    </span>
                  </div>
                )}
                
                {product.stock_quantity > 20 && (
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-600 font-medium text-sm">
                      ✅ In Stock
                    </span>
                  </div>
                )}
              </div>

              {/* Variants */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mb-6 space-y-4">
                  {Object.entries(product.attributes).map(([key, values]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {key}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(values as any[]).map((value) => (
                          <button
                            key={value}
                            onClick={() => setSelectedVariant((prev) => ({ ...prev, [key]: value }))}
                            className={cn(
                              "px-4 py-2.5 border-2 rounded-xl font-medium transition-all",
                              selectedVariant[key] === value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-200 hover:border-primary/50"
                            )}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="mb-6 space-y-4">
                {/* Quantity Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={isOutOfStock}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-6 py-3 min-w-[80px] text-center font-semibold text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 999, quantity + 1))}
                      className="p-3 hover:bg-gray-100 transition-colors"
                      disabled={isOutOfStock}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAdding}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all",
                      isOutOfStock
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-primary hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/30 active:scale-95"
                    )}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {isAdding ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white transition-all",
                      isOutOfStock
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-amber-500 hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
                    )}
                  >
                    <Zap className="w-5 h-5" />
                    Buy Now
                  </button>
                </div>

                {/* Delivery Estimator & Trust Badges - IMPROVED */}
                <div className="border border-gray-200 rounded-xl p-4 space-y-3 mt-4 bg-gray-50">
                  <div className="flex items-start gap-3 text-sm">
                    <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">
                        Free Delivery
                      </span>
                      <span className="text-gray-500 ml-1">
                        on orders over $100
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">
                        📦 Estimated delivery: 3-5 business days
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <RotateCcw className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">
                        Easy Returns
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">
                        30-day return policy - No questions asked
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 text-sm">
                    <Shield className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-900">
                        Secure Checkout
                      </span>
                      <p className="text-gray-500 text-xs mt-0.5">
                        🔒 SSL encrypted payment - 100% secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants */}
              {product.attributes && Object.keys(product.attributes).length > 0 && (
                <div className="mb-6 space-y-4">
                  {Object.entries(product.attributes).map(([key, values]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
                        {key}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(values as any[]).map((value) => (
                          <button
                            key={value}
                            onClick={() => setSelectedVariant((prev) => ({ ...prev, [key]: value }))}
                            className={cn(
                              "px-4 py-2.5 border-2 rounded-xl font-medium transition-all",
                              selectedVariant[key] === value
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-200 hover:border-primary/50"
                            )}
                          >
                            {value}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            <button
              onClick={() => setActiveTab('description')}
              className={cn(
                "px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2",
                activeTab === 'description'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specifications')}
              className={cn(
                "px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2",
                activeTab === 'specifications'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={cn(
                "px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors border-b-2",
                activeTab === 'reviews'
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Reviews ({product.review_count})
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8" ref={reviewsRef}>
            {activeTab === 'description' && (
              <div className="max-w-none">
                {product.description ? (
                  <div className="space-y-4 text-gray-600 leading-relaxed [&>h1]:text-xl [&>h1]:font-bold [&>h1]:text-gray-800 [&>h1]:mb-3 [&>h1]:mt-6 [&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-gray-800 [&>h2]:mb-2 [&>h2]:mt-4 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-gray-800 [&>h3]:mb-2 [&>h3]:mt-3 [&>p]:mb-4 [&>p]:text-gray-600 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:mb-4 [&>li]:mb-1 [&>strong]:font-semibold [&>b]:font-semibold">
                    <div dangerouslySetInnerHTML={{ __html: product.description }} />
                  </div>
                ) : (
                  <p className="text-gray-500">No description available.</p>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="overflow-x-auto">
                <table className="w-full max-w-2xl">
                  <tbody className="divide-y divide-gray-100">
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">Brand</td>
                      <td className="px-4 py-3 text-gray-600">Generic</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-700">SKU</td>
                      <td className="px-4 py-3 text-gray-600">{product.sku || 'N/A'}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">Category</td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.categories?.map(c => c.name).join(', ') || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-gray-700">Stock</td>
                      <td className="px-4 py-3 text-gray-600">{product.stock_quantity} units</td>
                    </tr>
                    {product.attributes && Object.entries(product.attributes).map(([key, value], index) => (
                      <tr key={key} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="px-4 py-3 font-semibold text-gray-700 capitalize">{key}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-4xl mx-auto">
                {/* Review Summary */}
                <div className="text-center mb-8 pb-8 border-b border-gray-100">
                  <div className="text-5xl mb-3">⭐</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Customer Reviews</h3>
                  <p className="text-gray-500 mb-4">
                    {reviews.length > 0
                      ? `Based on ${reviews.length} review${reviews.length > 1 ? 's' : ''}`
                      : "No reviews yet. Be the first to review!"}
                  </p>
                  {!isAuthenticated && (
                    <button
                      onClick={() => router.push('/login')}
                      className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                    >
                      Login to Write a Review
                    </button>
                  )}
                </div>

                {/* Write Review Form */}
                {isAuthenticated && showReviewForm && (
                  <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <h4 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h4>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      {/* Star Rating */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Rating
                        </label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "w-8 h-8",
                                  star <= newReview.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-gray-300"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Review Title
                        </label>
                        <input
                          type="text"
                          value={newReview.title}
                          onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                          placeholder="Summarize your experience"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                          required
                        />
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Review
                        </label>
                        <textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          placeholder="Write your detailed review..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none"
                          required
                        />
                      </div>

                      {/* Submit */}
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={submittingReview || newReview.rating === 0}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all",
                            submittingReview || newReview.rating === 0
                              ? "bg-gray-300 cursor-not-allowed"
                              : "bg-primary hover:bg-primary-dark"
                          )}
                        >
                          <Send className="w-4 h-4" />
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Reviews List */}
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                            {review.user_avatar ? (
                              <img src={review.user_avatar} alt={review.user_name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              review.user_name.charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900">{review.user_name}</span>
                              {review.verified_purchase && (
                                <span className="flex items-center gap-1 text-xs text-success bg-green-50 px-2 py-0.5 rounded-full">
                                  <BadgeCheck className="w-3 h-3" />
                                  Verified Purchase
                                </span>
                              )}
                            </div>

                            {/* Stars */}
                            <div className="flex items-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={cn(
                                    "w-4 h-4",
                                    star <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-gray-200"
                                  )}
                                />
                              ))}
                            </div>

                            {/* Title */}
                            <p className="font-semibold text-gray-900 mb-1">{review.title}</p>

                            {/* Comment */}
                            <p className="text-gray-600 leading-relaxed">{review.comment}</p>

                            {/* Date */}
                            <p className="text-xs text-gray-400 mt-3">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="text-gray-500 mb-6">No reviews yet. Be the first to review this product!</p>
                    {isAuthenticated && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
              <button
                onClick={() => router.push('/products')}
                className="flex items-center gap-2 text-primary font-semibold hover:underline"
              >
                View All <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed Products */}
        <RecentlyViewed />

        {/* Sticky Add to Cart Bar - Mobile Only */}
        {product && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 md:hidden z-50 shadow-lg safe-area-bottom">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">
                {product.name}
              </p>
              <p className={cn(
                "font-bold text-sm mt-0.5",
                product.is_on_sale ? "text-danger" : "text-primary"
              )}>
                {formatPrice(product.price)}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0 || isAdding}
              className={cn(
                "px-5 py-2.5 rounded-xl font-semibold text-sm transition flex-shrink-0",
                product.stock_quantity === 0
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-primary text-white hover:bg-primary-dark active:scale-95"
              )}
            >
              {isAdding ? 'Adding...' : product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        )}

        {/* Image Lightbox */}
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={(product?.images || []).map(img => ({ src: img }))}
          on={{
            view: ({ index }) => setLightboxIndex(index || 0),
          }}
        />
      </div>
    </div>
  );
}
