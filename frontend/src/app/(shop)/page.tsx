'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { productsApi, categoriesApi, Product, Category } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import { ChevronRight, Truck, Tag, Award, RefreshCcw, ShoppingBag, Zap } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [featuredRes, saleRes, categoriesRes] = await Promise.all([
          productsApi.getAll({ is_featured: true, per_page: 8 }),
          productsApi.getAll({ is_on_sale: true, per_page: 8 }),
          categoriesApi.getAll(),
        ]);
        setFeaturedProducts(featuredRes.data.products || []);
        setSaleProducts(saleRes.data.products || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Modern Redesign */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-secondary">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow" />
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                <span>Summer Sale - Up to 50% Off</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Discover Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                  Perfect Style
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-white/80 max-w-lg">
                Shop the latest trends at unbeatable prices. Free shipping on orders over $100!
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href="/products"
                  className="group px-8 py-4 bg-white text-primary font-bold rounded-xl 
                           hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl
                           flex items-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Shop Now
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/products?is_on_sale=true"
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 
                           text-white font-bold rounded-xl hover:bg-white/20 
                           transition-all duration-300"
                >
                  View Sale
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold">10K+</div>
                  <div className="text-white/60 text-sm">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-white/60 text-sm">Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">99%</div>
                  <div className="text-white/60 text-sm">Satisfaction</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Decorative Elements */}
            <div className="hidden md:block relative">
              <div className="relative h-96 w-full">
                {/* Floating Cards */}
                <div className="absolute top-0 right-0 w-64 h-40 bg-white/10 backdrop-blur-md rounded-2xl 
                              border border-white/20 shadow-2xl animate-float p-4">
                  <div className="w-full h-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 
                                rounded-xl flex items-center justify-center">
                    <span className="text-6xl">🛍️</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 w-56 h-48 bg-white/10 backdrop-blur-md rounded-2xl 
                              border border-white/20 shadow-2xl animate-float-delayed p-4">
                  <div className="w-full h-full bg-gradient-to-br from-emerald-400/20 to-teal-500/20 
                                rounded-xl flex items-center justify-center">
                    <span className="text-6xl">✨</span>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/4 w-40 h-32 bg-white/10 backdrop-blur-md rounded-2xl 
                              border border-white/20 shadow-2xl animate-float p-3">
                  <div className="w-full h-full bg-gradient-to-br from-violet-400/20 to-purple-500/20 
                                rounded-xl flex items-center justify-center">
                    <span className="text-5xl">🎁</span>
                  </div>
                </div>
                
                {/* Decorative Circles */}
                <div className="absolute top-1/4 right-1/4 w-24 h-24 border-2 border-white/20 rounded-full" />
                <div className="absolute bottom-1/4 right-1/3 w-16 h-16 border-2 border-white/30 rounded-full" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-12 md:h-20">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F8FAFC"/>
          </svg>
        </div>
      </section>

      {/* Features Strip - Enhanced */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureItem
              icon={<Truck className="w-7 h-7" />}
              title="Free Shipping"
              description="On orders over $100"
              color="from-blue-500 to-blue-600"
            />
            <FeatureItem
              icon={<Tag className="w-7 h-7" />}
              title="Best Prices"
              description="We match any price"
              color="from-violet-500 to-violet-600"
            />
            <FeatureItem
              icon={<Award className="w-7 h-7" />}
              title="Quality Products"
              description="Certified brands only"
              color="from-amber-500 to-amber-600"
            />
            <FeatureItem
              icon={<RefreshCcw className="w-7 h-7" />}
              title="Easy Returns"
              description="30-day return policy"
              color="from-emerald-500 to-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Browse through our wide selection of categories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.id}
                name={category.name}
                slug={category.slug}
              />
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/products" className="btn-outline inline-flex items-center gap-2">
              View All Categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle">Handpicked selection of our best products</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 animate-pulse border border-gray-100">
                  <div className="h-48 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-5xl mb-3">📦</div>
              <p className="text-gray-500">No featured products available yet.</p>
              <Link href="/products" className="btn-primary mt-3 inline-block text-sm px-4 py-2">
                Browse All Products
              </Link>
            </div>
          )}

          {!loading && featuredProducts.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/products?is_featured=true" className="btn-outline inline-flex items-center gap-2 text-sm">
                View All Featured
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Sale Products */}
      <section className="py-8 bg-gradient-to-b from-background to-white">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="section-header">
            <h2 className="section-title">On Sale</h2>
            <p className="section-subtitle">Don't miss out on these amazing deals</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-3 animate-pulse border border-gray-100">
                  <div className="h-48 bg-gray-200 rounded-xl mb-3" />
                  <div className="h-3 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : saleProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-5xl mb-3">🏷️</div>
              <p className="text-gray-500">No sale products available right now.</p>
              <Link href="/products" className="btn-primary mt-3 inline-block text-sm px-4 py-2">
                Browse All Products
              </Link>
            </div>
          )}

          {!loading && saleProducts.length > 0 && (
            <div className="mt-6 text-center">
              <Link href="/products?is_on_sale=true" className="btn-outline inline-flex items-center gap-2 text-sm">
                View All Sale Items
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Newsletter - Redesigned */}
      <section className="py-12 bg-gradient-to-r from-primary to-secondary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white mb-4">
              <span>📧</span>
              <span>Get 10% off your first order</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-sm md:text-base text-white/80 mb-6">
              Get the latest updates on new products and upcoming sales
            </p>

            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary font-bold rounded-lg
                         hover:bg-gray-100 transition-all duration-200 shadow-lg
                         hover:shadow-xl active:scale-95 text-sm"
              >
                Subscribe
              </button>
            </form>

            <p className="text-xs text-white/60 mt-3">
              By subscribing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureItem({ icon, title, description, color }: FeatureItemProps) {
  return (
    <div className="group flex items-center gap-3 p-4 rounded-xl
                    hover:bg-gray-50 transition-all duration-300
                    border border-transparent hover:border-gray-100">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color}
                      flex items-center justify-center text-white
                      shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-muted">{description}</p>
      </div>
    </div>
  );
}
