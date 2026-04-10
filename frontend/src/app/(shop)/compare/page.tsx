'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  GitCompare,
  Star,
  ShoppingCart,
  ArrowRight,
  Package,
  Tag,
  Scale,
  FileText,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCompareStore, useCartStore, useAuthStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export default function ComparePage() {
  const router = useRouter();
  const { compareItems, removeFromCompare, clearCompare } = useCompareStore();
  const { addToCart } = useCartStore();
  const { user } = useAuthStore();
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const handleAddToCart = async (productId: number, productName: string) => {
    if (!user) {
      router.push(`/login?redirect=/compare`);
      toast.error('Please log in to add items to cart');
      return;
    }

    setAddingToCart(productId);
    try {
      await addToCart(productId, 1);
      toast.success(`${productName} added to cart!`);
    } catch (error: any) {
      const status = error.response?.status;
      const msg = error.response?.data?.detail;

      if (status === 400 && msg?.includes('stock')) {
        toast.error('This product is out of stock');
      } else {
        toast.error('Failed to add to cart');
      }
    } finally {
      setAddingToCart(null);
    }
  };

  const handleRemoveProduct = (id: number) => {
    removeFromCompare(id);
    toast.success('Product removed from comparison');
  };

  // Find best values for highlighting
  const prices = compareItems.map(p => p.price);
  const minPrice = Math.min(...prices);
  
  const ratings = compareItems.map(p => p.rating);
  const maxRating = Math.max(...ratings);
  
  const reviews = compareItems.map(p => p.review_count);
  const maxReviews = Math.max(...reviews);

  if (compareItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          {/* Illustration */}
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <GitCompare className="w-16 h-16 text-blue-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            No Products to Compare
          </h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Add products to compare their features and specifications side by side
          </p>
          
          <Link href="/products">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
            >
              Browse Products
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Product Comparison
          </h1>
          <p className="text-gray-600 mt-1">
            Comparing {compareItems.length} product{compareItems.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clearCompare}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          
          <Link href="/products">
            <Button variant="outline" className="gap-2">
              <GitCompare className="w-4 h-4" />
              Add More
            </Button>
          </Link>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              {/* Labels Column (Sticky) */}
              <th className="w-40 p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <span className="text-sm font-semibold text-gray-700">Product</span>
              </th>
              
              {/* Product Columns */}
              {compareItems.map((product) => (
                <th key={product.id} className="p-4 bg-gray-50 border-b border-gray-200 min-w-[220px]">
                  <div className="relative">
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="absolute top-0 right-0 p-1.5 hover:bg-red-100 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                      aria-label="Remove from compare"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden bg-gray-100 group">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors text-center">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                </th>
              ))}
              
              {/* Empty placeholder columns to fill up to 4 */}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <th key={index} className="p-4 bg-gray-50 border-b border-gray-200 min-w-[220px]">
                  <Link
                    href="/products"
                    className="flex flex-col items-center justify-center h-full py-8 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                      <GitCompare className="w-8 h-8" />
                    </div>
                    <span className="text-sm font-medium">Add Product</span>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {/* Price Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag className="w-4 h-4" />
                  Price
                </div>
              </td>
              {compareItems.map((product) => (
                <td
                  key={product.id}
                  className={`p-4 border-b border-gray-200 text-center ${
                    product.price === minPrice ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-xl font-bold ${
                      product.price === minPrice ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {formatPrice(product.price)}
                    </span>
                    {product.compare_price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.compare_price)}
                      </span>
                    )}
                    {product.price === minPrice && (
                      <span className="text-xs text-green-600 font-medium mt-1">
                        Best Price
                      </span>
                    )}
                  </div>
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Rating Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Star className="w-4 h-4" />
                  Rating
                </div>
              </td>
              {compareItems.map((product) => (
                <td
                  key={product.id}
                  className={`p-4 border-b border-gray-200 text-center ${
                    product.rating === maxRating && product.rating > 0 ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-gray-200 text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 font-semibold text-gray-900">
                      {product.rating > 0 ? product.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  {product.rating === maxRating && product.rating > 0 && (
                    <span className="text-xs text-green-600 font-medium">Highest</span>
                  )}
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Reviews Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Reviews
                </div>
              </td>
              {compareItems.map((product) => (
                <td
                  key={product.id}
                  className={`p-4 border-b border-gray-200 text-center ${
                    product.review_count === maxReviews && product.review_count > 0 ? 'bg-green-50' : ''
                  }`}
                >
                  <span className="text-gray-900 font-medium">
                    {product.review_count}
                  </span>
                  {product.review_count === maxReviews && product.review_count > 0 && (
                    <span className="text-xs text-green-600 font-medium ml-2">Most</span>
                  )}
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Stock Status Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <CheckCircle className="w-4 h-4" />
                  Stock Status
                </div>
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 border-b border-gray-200 text-center">
                  {product.stock_quantity > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" />
                      In Stock ({product.stock_quantity})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <AlertCircle className="w-3 h-3" />
                      Out of Stock
                    </span>
                  )}
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* SKU Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package className="w-4 h-4" />
                  SKU
                </div>
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 border-b border-gray-200 text-center">
                  <span className="text-sm text-gray-600 font-mono">
                    {product.sku || 'N/A'}
                  </span>
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Weight Row (if available) */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Scale className="w-4 h-4" />
                  Weight
                </div>
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 border-b border-gray-200 text-center">
                  <span className="text-sm text-gray-600">
                    {product.attributes?.weight || product.attributes?.Weight || 'N/A'}
                  </span>
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Description Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10 align-top">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FileText className="w-4 h-4" />
                  Description
                </div>
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 border-b border-gray-200">
                  <p className="text-sm text-gray-600 text-center line-clamp-3">
                    {product.short_description || product.description || 'No description available'}
                  </p>
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>

            {/* Add to Cart Row */}
            <tr>
              <td className="p-4 bg-gray-50 border-b border-r border-gray-200 sticky left-0 z-10">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <ShoppingCart className="w-4 h-4" />
                  Action
                </div>
              </td>
              {compareItems.map((product) => (
                <td key={product.id} className="p-4 border-b border-gray-200 text-center">
                  <button
                    onClick={() => handleAddToCart(product.id, product.name)}
                    disabled={addingToCart === product.id || product.stock_quantity === 0}
                    className={`w-full max-w-[160px] py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                      product.stock_quantity === 0
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : addingToCart === product.id
                        ? 'bg-blue-400 text-white cursor-wait'
                        : 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700'
                    }`}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Adding...
                      </>
                    ) : product.stock_quantity === 0 ? (
                      'Out of Stock'
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </td>
              ))}
              {Array.from({ length: 4 - compareItems.length }).map((_, index) => (
                <td key={index} className="p-4 border-b border-gray-200 bg-gray-50/50" />
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Info Banner */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <GitCompare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Comparison Tips</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Green highlights indicate the best value for each attribute</li>
            <li>You can compare up to 4 products at a time</li>
            <li>Click the × button to remove a product from comparison</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
