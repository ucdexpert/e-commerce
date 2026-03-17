'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, X, LogOut, ChevronDown, Loader, ArrowRight } from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import { cn, formatPrice } from '@/lib/utils';
import axios from 'axios';

interface SearchSuggestion {
  id: number;
  name: string;
  slug: string;
  price: number;
  images?: string[];
}

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { isMobileMenuOpen, toggleMobileMenu, isSearchOpen, toggleSearch } = useUIStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Search autocomplete state
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Debounced search suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setIsLoadingSuggestions(true);
    setSelectedIndex(-1);

    const timer = setTimeout(async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await axios.get(`${API_URL}/search/suggestions`, {
          params: { q: searchQuery, limit: 6 }
        });
        setSuggestions(response.data.suggestions || response.data || []);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    router.push(`/products/${slug}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex].slug);
        } else if (searchQuery.trim()) {
          router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
          setShowSuggestions(false);
        }
        break;
    }
  }, [showSuggestions, suggestions, selectedIndex, searchQuery, router]);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
    { href: '/products?is_on_sale=true', label: 'Sale' },
    { href: '/products?is_featured=true', label: 'Featured' },
    { href: '/products?sort_by=rating&sort_order=desc', label: 'Best Sellers' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 bg-white transition-all duration-300",
      isScrolled
        ? "shadow-lg border-b border-gray-100"
        : "shadow-sm border-b"
    )}>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-primary to-secondary text-white py-2">
        <div className="container mx-auto px-4 text-center text-xs md:text-sm font-medium">
          🎉 Free Shipping on Orders Over $100 | Use code: <span className="font-bold">WELCOME10</span> for 10% off
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-3 md:gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center text-white font-bold text-xl
                            group-hover:scale-105 transition-transform shadow-md">
              E
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-secondary
                           bg-clip-text text-transparent hidden sm:block">
              E-Shop
            </span>
          </Link>

          {/* Search Bar - Desktop with Autocomplete */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                  className="w-full px-5 py-2.5 pl-12 pr-12 border-2 border-gray-200 rounded-full
                           focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10
                           transition-all bg-gray-50 hover:bg-white"
                />
                {isLoadingSuggestions && (
                  <Loader className="absolute right-12 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
                )}
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-r from-primary to-primary-dark
                           text-white rounded-full hover:shadow-lg transition-all active:scale-95"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 md:left-auto md:right-auto md:w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100
                            overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200
                            max-w-[calc(100vw-2rem)] md:max-w-none">
                {suggestions.length > 0 ? (
                  <>
                    <div className="max-h-96 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={suggestion.id}
                          onClick={() => handleSuggestionClick(suggestion.slug)}
                          className={cn(
                            "w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
                            index === selectedIndex ? "bg-primary/5" : ""
                          )}
                        >
                          {/* Product Image */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {suggestion.images?.[0] ? (
                              <img
                                src={suggestion.images[0]}
                                alt={suggestion.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{suggestion.name}</p>
                            <p className="text-primary font-semibold text-sm">{formatPrice(suggestion.price)}</p>
                          </div>
                          
                          {/* Arrow Icon */}
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                    
                    {/* Search All Button */}
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setShowSuggestions(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 
                               transition-colors border-t border-gray-100 text-primary font-medium text-sm"
                    >
                      <Search className="w-4 h-4" />
                      Search for "{searchQuery}"
                    </button>
                  </>
                ) : isLoadingSuggestions ? (
                  <div className="flex items-center justify-center gap-2 p-6 text-gray-500">
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Searching...</span>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No suggestions found</p>
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
                        setShowSuggestions(false);
                      }}
                      className="mt-2 text-primary font-medium hover:underline text-sm"
                    >
                      Search for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Mobile Search Toggle */}
            <button
              onClick={toggleSearch}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle search"
            >
              <Search className="w-5 h-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  href="/wishlist"
                  className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors group"
                  aria-label="Wishlist"
                >
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-danger transition-colors" />
                </Link>
                <Link
                  href="/cart"
                  className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors group"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-600 group-hover:text-primary transition-colors" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 bg-danger text-white
                                   text-xs font-bold rounded-full flex items-center justify-center
                                   px-1 shadow-md animate-pulse">
                      {cartItemsCount > 9 ? '9+' : cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative group">
                  <button className="flex items-center gap-2 p-1.5 md:p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary to-secondary
                                  flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden lg:block font-medium text-gray-700">{user?.username}</span>
                    <ChevronDown className="hidden lg:block w-4 h-4 text-gray-400" />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100
                                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                                transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100
                                overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.username}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50
                               hover:text-danger transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-primary border-2 border-primary
                           rounded-full hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-primary-dark
                           rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-200
                           active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="mt-4 md:hidden">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl
                         focus:outline-none focus:border-primary bg-white"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "border-t border-gray-100 overflow-hidden transition-all duration-300",
        isMobileMenuOpen ? "block max-h-96" : "hidden md:block max-h-20"
      )}>
        <div className="container mx-auto px-4">
          <ul className={cn(
            "flex gap-1 md:gap-2 py-2",
            isMobileMenuOpen ? "flex-col" : "flex-row items-center justify-center"
          )}>
            {navLinks.map((link) => (
              <li key={link.href} className={isMobileMenuOpen ? "w-full" : ""}>
                <Link
                  href={link.href}
                  className={cn(
                    "block px-4 py-2.5 rounded-xl font-medium transition-all duration-200",
                    isActive(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                    isMobileMenuOpen
                      ? "border-b border-gray-50 last:border-0"
                      : "relative after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-primary after:transition-all hover:after:w-full"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
