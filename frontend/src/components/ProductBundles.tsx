'use client';

import { useState } from 'react';
import { Package, ShoppingCart, Check, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface ProductBundle {
  id: number;
  name: string;
  discount_percent: number;
  total_savings: number;
  products: BundleProduct[];
}

interface BundleProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  in_stock: boolean;
  selected: boolean;
}

interface ProductBundlesProps {
  productId: number;
}

export function ProductBundles({ productId }: ProductBundlesProps) {
  const [selectedBundle, setSelectedBundle] = useState<number | null>(null);

  // Mock bundles data
  const bundles: ProductBundle[] = [
    {
      id: 1,
      name: 'Complete Audio Setup',
      discount_percent: 15,
      total_savings: 45.97,
      products: [
        { id: 1, name: 'Premium Wireless Headphones', price: 99.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
        { id: 2, name: 'Headphone Stand', price: 29.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
        { id: 3, name: 'Audio Cable 3.5mm', price: 14.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
      ],
    },
    {
      id: 2,
      name: 'Travel Essentials',
      discount_percent: 10,
      total_savings: 24.99,
      products: [
        { id: 1, name: 'Premium Wireless Headphones', price: 99.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
        { id: 4, name: 'Travel Case', price: 39.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
        { id: 5, name: 'Portable Charger', price: 49.99, image: 'https://via.placeholder.com/80', in_stock: true, selected: true },
      ],
    },
  ];

  const handleAddBundleToCart = (bundle: ProductBundle) => {
    console.log('Adding bundle to cart:', bundle);
    // Add bundle to cart logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold">Product Bundles</h2>
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Save up to 15%
        </Badge>
      </div>

      <div className="grid gap-6">
        {bundles.map((bundle) => (
          <div
            key={bundle.id}
            className={`border rounded-xl p-6 transition-all ${
              selectedBundle === bundle.id
                ? 'border-primary bg-primary/5 ring-2 ring-primary'
                : 'hover:border-primary/50'
            }`}
          >
            {/* Bundle Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{bundle.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {bundle.products.length} items • Save {bundle.discount_percent}%
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-xl font-bold text-green-600">
                  ${bundle.total_savings.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Bundle Products */}
            <div className="space-y-3 mb-4">
              {bundle.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                >
                  <Checkbox
                    checked={product.selected}
                    disabled
                    className="w-5 h-5"
                  />
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  {product.in_stock ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
              ))}
            </div>

            {/* Bundle Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Bundle Price</p>
                <div className="flex items-center gap-3">
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(
                      bundle.products.reduce((sum, p) => sum + p.price, 0)
                    )}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(
                      bundle.products.reduce((sum, p) => sum + p.price, 0) *
                        (1 - bundle.discount_percent / 100)
                    )}
                  </span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => handleAddBundleToCart(bundle)}
                className="gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add Bundle to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Bundle Benefits */}
      <div className="grid gap-4 md:grid-cols-3 mt-8">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold">Best Value</h4>
            <p className="text-sm text-muted-foreground">
              Save up to 15% compared to buying individually
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold">One-Click Purchase</h4>
            <p className="text-sm text-muted-foreground">
              Add all items to cart with a single click
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Gift className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold">Perfect Combination</h4>
            <p className="text-sm text-muted-foreground">
              Curated products that work great together
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductBundles;
