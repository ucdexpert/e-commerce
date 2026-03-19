'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productsApi, Product } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Read all filters from URL search params
  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentCategory = searchParams.get('category_id') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentIsFeatured = searchParams.get('is_featured') === 'true';
  const currentIsOnSale = searchParams.get('is_on_sale') === 'true';
  const currentSortBy = searchParams.get('sort_by') || 'created_at';
  const currentSortOrder = searchParams.get('sort_order') || 'desc';

  // Update URL when filters change
  const updateFilters = (newFilters: Record<string, any>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === '' || value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    // Reset to page 1 when filters change (unless page is explicitly set)
    if (!newFilters.page) {
      params.set('page', '1');
    }
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Build filters object for API call
  const filters = {
    page: currentPage,
    per_page: 12,
    search: currentSearch || undefined,
    category_id: currentCategory || undefined,
    min_price: currentMinPrice ? Number(currentMinPrice) : undefined,
    max_price: currentMaxPrice ? Number(currentMaxPrice) : undefined,
    is_featured: currentIsFeatured || undefined,
    is_on_sale: currentIsOnSale || undefined,
    sort_by: currentSortBy,
    sort_order: currentSortOrder,
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { ...filters };
      // Remove undefined values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) delete params[key];
      });

      const response = await productsApi.getAll(params);
      setProducts(response.data.products || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    router.push('/products');
  };

  const hasActiveFilters = currentSearch || currentCategory || currentMinPrice || currentMaxPrice || currentIsFeatured || currentIsOnSale;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-gray-600">
          {total} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg"
        >
          <Filter className="w-5 h-5" />
          Filters
        </button>

        {/* Filters Sidebar */}
        <aside className={cn(
          "lg:w-64 space-y-6",
          showFilters ? "block" : "hidden lg:block"
        )}>
          <div className="bg-white p-4 rounded-lg border sticky top-24">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                value={currentSearch}
                onChange={(e) => updateFilters({ search: e.target.value })}
                placeholder="Search products..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Price Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={currentMinPrice}
                  onChange={(e) => updateFilters({ min_price: e.target.value })}
                  placeholder="Min"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  type="number"
                  value={currentMaxPrice}
                  onChange={(e) => updateFilters({ max_price: e.target.value })}
                  placeholder="Max"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentIsFeatured}
                  onChange={(e) => updateFilters({ is_featured: e.target.checked ? 'true' : '' })}
                  className="rounded"
                />
                <span className="text-sm">Featured Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currentIsOnSale}
                  onChange={(e) => updateFilters({ is_on_sale: e.target.checked ? 'true' : '' })}
                  className="rounded"
                />
                <span className="text-sm">On Sale</span>
              </label>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={`${currentSortBy}-${currentSortOrder}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('-');
                  updateFilters({ sort_by, sort_order });
                }}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="sold_count-desc">Best Sellers</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No products found.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 text-center">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
