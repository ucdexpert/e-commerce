'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Share2, Copy, Check, ShoppingCart, Heart, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

interface Wishlist {
  id: string;
  owner_name: string;
  owner_email: string;
  created_at: string;
  is_public: boolean;
  items: WishlistItem[];
}

interface WishlistItem {
  id: number;
  product: any;
  added_at: string;
}

export default function SharedWishlistPage() {
  const params = useParams();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with API call using params.token
    setTimeout(() => {
      setWishlist({
        id: 'abc123',
        owner_name: 'John Doe',
        owner_email: 'john@example.com',
        created_at: '2026-03-15',
        is_public: true,
        items: [
          {
            id: 1,
            product: {
              id: 1,
              name: 'Premium Wireless Headphones',
              price: 99.99,
              image: 'https://via.placeholder.com/300',
              rating: 4.5,
              reviews: 234,
              in_stock: true,
            },
            added_at: '2026-03-15',
          },
          {
            id: 2,
            product: {
              id: 2,
              name: 'Smart Watch Pro',
              price: 149.99,
              image: 'https://via.placeholder.com/300',
              rating: 4.7,
              reviews: 189,
              in_stock: true,
            },
            added_at: '2026-03-16',
          },
        ],
      });
      setLoading(false);
    }, 500);
  }, [params.token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${wishlist?.owner_name}'s Wishlist`,
        text: 'Check out my wishlist!',
        url: window.location.href,
      });
    } else {
      handleCopyLink();
    }
  };

  const handleAddAllToCart = () => {
    toast.success('All items added to cart!');
    // Add all items to cart logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Wishlist Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This wishlist may have been removed or is private
        </p>
        <Button onClick={() => window.location.href = '/products'}>
          Browse Products
        </Button>
      </div>
    );
  }

  const totalValue = wishlist.items.reduce(
    (sum, item) => sum + item.product.price,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Heart className="w-8 h-8 text-pink-600 fill-pink-600" />
          <h1 className="text-3xl font-bold">
            {wishlist.owner_name}'s Wishlist
          </h1>
        </div>
        <p className="text-muted-foreground mb-6">
          Created on {new Date(wishlist.created_at).toLocaleDateString()}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button onClick={handleShare} variant="outline" className="gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="gap-2">
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </Button>
          <Button onClick={handleAddAllToCart} className="gap-2 bg-pink-600 hover:bg-pink-700">
            <ShoppingCart className="w-4 h-4" />
            Add All to Cart
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">Total Items</p>
          <p className="text-3xl font-bold">{wishlist.items.length}</p>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-3xl font-bold text-primary">{formatPrice(totalValue)}</p>
        </div>
        <div className="bg-card rounded-lg border p-6 text-center">
          <p className="text-sm text-muted-foreground">In Stock</p>
          <p className="text-3xl font-bold text-green-600">
            {wishlist.items.filter(i => i.product.in_stock).length}
          </p>
        </div>
      </div>

      {/* Wishlist Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Items ({wishlist.items.length})</h2>
          <Badge variant="outline">Public Wishlist</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.items.map((item) => (
            <div key={item.id} className="relative group">
              <ProductCard product={item.product} />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Badge variant="secondary">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Options */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-xl font-bold mb-4">Share This Wishlist</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Button variant="outline" className="h-auto py-4">
            <Share2 className="w-6 h-6 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Share Link</p>
              <p className="text-xs text-muted-foreground">Copy to clipboard</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <Mail className="w-6 h-6 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Email</p>
              <p className="text-xs text-muted-foreground">Send via email</p>
            </div>
          </Button>
          <Button variant="outline" className="h-auto py-4">
            <Heart className="w-6 h-6 mr-2" />
            <div className="text-left">
              <p className="font-semibold">Create Yours</p>
              <p className="text-xs text-muted-foreground">Make your wishlist</p>
            </div>
          </Button>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This is a public wishlist. You can add items to your cart or create your own wishlist to save items.
        </p>
      </div>
    </div>
  );
}
