---
name: ecommerce-ui-developer
description: Expert Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui developer specialized in high-converting e-commerce UIs
version: 1.0.0
triggers:
  - ecommerce
  - product page
  - cart
  - checkout
  - shop
  - store
  - category
  - collection
  - add to cart
  - product gallery
  - e-commerce ui
  - online store
---

# E-commerce UI Developer Skill

Expert Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui developer specialized in building high-converting, modern E-commerce UIs. Creates premium, clean, fast-loading, and beautiful interfaces for online stores that focus on conversion, trust, and excellent user experience. Avoids generic AI slop and follows modern e-commerce design patterns (like Shopify, Vercel Commerce, Nike, Apple Store style).

## Core Focus Areas

### 1. Product Pages
- Image galleries with zoom, thumbnails, swipe support
- Product variants (size, color, material) with visual selectors
- Add to cart with optimistic updates
- Reviews and ratings with photos
- Related products and cross-sells
- Sticky add-to-cart bar on mobile
- Size guides, fit recommendations
- Stock availability indicators
- Delivery estimates and shipping info

### 2. Cart & Checkout
- Cart drawer/sheet with real-time updates
- Slide-out mini cart from any page
- Quantity adjustments with debounced updates
- Discount code application
- Free shipping progress bar
- Multi-step checkout flow
- One-page checkout option
- Guest checkout support
- Payment method selection
- Order summary with trust badges

### 3. Category & Collection Pages
- Grid and list view toggles
- Advanced filters (price, size, color, brand, rating)
- Mobile-friendly filter drawer
- Sorting options (price, popularity, newest)
- Infinite scroll or pagination
- Product count and active filters
- SEO-optimized category descriptions
- Breadcrumb navigation

### 4. Marketing & Conversion
- Hero sections with CTAs
- Featured products carousel
- Deal banners with countdown timers
- Newsletter signup modals
- Recently viewed products
- Wishlist functionality
- Quick view modals
- Back in stock notifications
- Price drop alerts

### 5. Performance & UX
- Server Components for fast initial load
- Optimized images with next/image
- Lazy loading for below-fold content
- Skeleton loaders for all states
- Optimistic UI updates
- Proper error boundaries
- Mobile-first responsive design
- Dark mode support
- Accessibility (WCAG AA compliant)

## Design & UX Rules

### Conversion-Focused Design
- **Clear CTAs**: Primary actions stand out with proper color contrast
- **Trust Signals**: Secure checkout badges, payment icons, guarantees
- **Social Proof**: Reviews, ratings, user photos, testimonials
- **Urgency**: Low stock indicators, sale countdowns (used sparingly)
- **Scarcity**: "Only X left" messages (honest, not fake)
- **Free Shipping Threshold**: Progress bar showing how much more to qualify

### Premium Modern Aesthetic
- **Clean Typography**: Inter or system fonts, proper hierarchy
- **Generous Whitespace**: Let products breathe, don't cram
- **Subtle Animations**: Hover effects, add-to-cart feedback, page transitions
- **Consistent Spacing**: 8px grid system throughout
- **Professional Photography**: Assume high-quality product images
- **Minimal Distractions**: Focus on products, not flashy elements

### Color Palettes by Niche

#### Fashion & Apparel
```ts
// Elegant, neutral background to let products pop
primary: "222 47% 11%"      // Dark navy/black
accent: "45 93% 47%"        // Gold for premium feel
background: "0 0% 100%"     // Clean white
```

#### Electronics & Tech
```ts
// Clean, modern, trustworthy
primary: "0 0% 6%"          // Almost black
accent: "217 91% 60%"       // Tech blue
background: "0 0% 100%"     // White with gray sections
```

#### Beauty & Cosmetics
```ts
// Soft, feminine, luxurious
primary: "330 81% 60%"      // Rose/pink
accent: "280 65% 70%"       // Lavender
background: "0 0% 98%"      // Off-white
```

#### General/Multi-Niche
```ts
// Versatile, professional
primary: "222 84% 5%"       // Deep navy
accent: "160 85% 37%"       // Emerald green (success/buy)
background: "0 0% 100%"     // Clean white
```

### Mobile-First UX Patterns

#### Mobile Navigation
- Bottom tab bar for main navigation (Home, Shop, Cart, Account)
- Hamburger menu for secondary links
- Sticky add-to-cart button
- Swipeable product image galleries
- Bottom sheet for filters
- Large touch targets (min 44x44px)

#### Mobile Checkout
- Auto-fill address with autocomplete
- Digital wallet buttons (Apple Pay, Google Pay) at top
- Minimal form fields
- Progress indicator
- Ability to save info for later

### Desktop Enhancements
- Hover quick view on product cards
- Mega menu for categories
- Multi-column filters
- Larger image galleries
- Keyboard navigation support
- Compare products feature

## Technical Requirements

### Next.js App Router Architecture
- **Server Components by Default**: Fetch product data on server
- **Client Components Only When Needed**: Cart interactions, image zoom, filters
- **Server Actions**: Add to cart, wishlist, checkout mutations
- **Streaming**: Load product info first, reviews later
- **Parallel Routes**: Show cart alongside browsing

### File Structure
```
app/
├── (shop)/
│   ├── page.tsx                    # Homepage
│   ├── products/
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # Product detail
│   │   │   ├── loading.tsx
│   │   │   └── opengraph-image.tsx
│   │   └── page.tsx                # All products
│   ├── category/
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # Category page
│   │   │   └── loading.tsx
│   │   └── page.tsx
│   ├── collection/
│   │   └── [slug]/
│   │       └── page.tsx            # Curated collections
│   ├── search/
│   │   └── page.tsx                # Search results
│   └── cart/
│       └── page.tsx                # Full cart page
├── (checkout)/
│   ├── checkout/
│   │   ├── page.tsx                # Checkout flow
│   │   ├── success/
│   │   │   └── page.tsx            # Order confirmation
│   │   └── cancel/
│   │       └── page.tsx
│   └── layout.tsx                  # Minimal header/footer
├── (account)/
│   ├── account/
│   │   ├── page.tsx                # Dashboard
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── addresses/
│   │   │   └── page.tsx
│   │   └── wishlist/
│   │       └── page.tsx
│   └── login/
│       └── page.tsx
├── api/
│   ├── cart/
│   │   └── route.ts
│   ├── wishlist/
│   │   └── route.ts
│   ├── products/
│   │   └── [slug]/
│   │       └── route.ts
│   └── webhooks/
│       └── stripe/
│           └── route.ts
├── components/
│   ├── cart/
│   │   ├── cart-drawer.tsx
│   │   ├── cart-item.tsx
│   │   └── add-to-cart-button.tsx
│   ├── product/
│   │   ├── product-gallery.tsx
│   │   ├── product-variants.tsx
│   │   ├── product-price.tsx
│   │   ├── product-reviews.tsx
│   │   └── related-products.tsx
│   ├── category/
│   │   ├── filter-drawer.tsx
│   │   ├── product-grid.tsx
│   │   └── sort-dropdown.tsx
│   ├── checkout/
│   │   ├── checkout-form.tsx
│   │   ├── payment-methods.tsx
│   │   └── order-summary.tsx
│   ├── shared/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── newsletter-signup.tsx
│   │   └── trust-badges.tsx
│   └── ui/                         # shadcn components
├── lib/
│   ├── actions/
│   │   ├── cart.ts
│   │   ├── wishlist.ts
│   │   ├── checkout.ts
│   │   └── reviews.ts
│   ├── db/
│   │   ├── products.ts
│   │   ├── orders.ts
│   │   └── customers.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── constants.ts
├── hooks/
│   ├── use-cart.ts
│   ├── use-wishlist.ts
│   └── use-product-variants.ts
├── types/
│   ├── product.ts
│   ├── cart.ts
│   ├── order.ts
│   └── customer.ts
└── styles/
    └── globals.css
```

### Server Actions Examples

#### Add to Cart
```tsx
"use server"

import { revalidateTag } from "next/cache"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function addToCart(formData: FormData) {
  const productId = formData.get("productId") as string
  const variantId = formData.get("variantId") as string
  const quantity = Number(formData.get("quantity")) || 1

  // Get or create cart
  const cartId = cookies().get("cart_id")?.value
  const cart = await getOrCreateCart(cartId)

  // Add or update item
  await db.cartItem.upsert({
    where: {
      cartId_productId_variantId: {
        cartId: cart.id,
        productId,
        variantId,
      },
    },
    update: {
      quantity: { increment: quantity },
    },
    create: {
      cartId: cart.id,
      productId,
      variantId,
      quantity,
    },
  })

  revalidateTag("cart")
  
  return {
    success: true,
    message: "Added to cart",
  }
}
```

#### Create Checkout Session
```tsx
"use server"

import Stripe from "stripe"
import { redirect } from "next/navigation"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function createCheckoutSession(formData: FormData) {
  const cartId = formData.get("cartId") as string
  
  const cart = await getCartWithItems(cartId)
  
  const session = await stripe.checkout.sessions.create({
    line_items: cart.items.map(item => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: [item.product.images[0].url],
        },
        unit_amount: item.product.price,
      },
      quantity: item.quantity,
    })),
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/checkout/cancel`,
    metadata: {
      cartId,
    },
  })

  redirect(session.url!)
}
```

### Component Patterns

#### Product Card (shadcn + Tailwind)
```tsx
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Eye } from "lucide-react"
import type { Product } from "@/types/product"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "featured"
}

export function ProductCard({ product, variant = "default" }: ProductCardProps) {
  const isOutOfStock = product.stock === 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <Card className="group relative overflow-hidden">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-square">
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform group-hover:scale-105"
          priority={variant === "featured"}
        />
        
        {/* Badges */}
        {product.salePrice && (
          <Badge className="absolute left-2 top-2 bg-destructive">
            Sale
          </Badge>
        )}
        {isLowStock && !isOutOfStock && (
          <Badge className="absolute left-2 top-2 bg-amber-500">
            Only {product.stock} left
          </Badge>
        )}
        
        {/* Quick Actions */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </Link>

      {/* Info */}
      <CardContent className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-medium truncate">{product.name}</h3>
        </Link>
        
        {product.category && (
          <p className="text-sm text-muted-foreground">
            {product.category.name}
          </p>
        )}
        
        <div className="mt-2 flex items-center gap-2">
          {product.salePrice ? (
            <>
              <span className="font-semibold text-destructive">
                ${product.salePrice.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="font-semibold">${product.price.toFixed(2)}</span>
          )}
        </div>

        {/* Rating */}
        {product.rating && (
          <div className="mt-2 flex items-center gap-1">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

#### Cart Drawer
```tsx
"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { CartItem } from "./cart-item"
import { useCart } from "@/hooks/use-cart"
import { ShoppingBag, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const router = useRouter()
  const { items, subtotal, shippingThreshold } = useCart()
  
  const freeShippingProgress = Math.min((subtotal / shippingThreshold) * 100, 100)
  const qualifiesForFreeShipping = subtotal >= shippingThreshold

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {/* Free Shipping Progress */}
        {!qualifiesForFreeShipping && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm mb-2">
              Add ${(shippingThreshold - subtotal).toFixed(2)} more for free shipping
            </p>
            <Progress value={freeShippingProgress} className="h-2" />
          </div>
        )}

        {qualifiesForFreeShipping && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              ✓ You've unlocked free shipping!
            </p>
          </div>
        )}

        {/* Cart Items */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-4 space-y-4">
            {items.length === 0 ? (
              <EmptyCart />
            ) : (
              items.map(item => (
                <CartItem key={item.id} item={item} />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {items.length > 0 && (
          <div className="mt-auto pt-4 border-t space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout
            </p>
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => {
                onOpenChange(false)
                router.push("/checkout")
              }}
            >
              Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/cart")}>
              View Full Cart
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
```

#### Product Gallery with Zoom
```tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ZoomIn, ZoomOut } from "lucide-react"
import type { ProductImage } from "@/types/product"

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
        <Image
          src={images[selectedImage].url}
          alt={`${productName} - Image ${selectedImage + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn(
            "object-cover transition-transform",
            isZoomed && "scale-150"
          )}
          priority
        />
        
        {/* Zoom Toggle */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background"
        >
          {isZoomed ? (
            <ZoomOut className="h-5 w-5" />
          ) : (
            <ZoomIn className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors",
                  selectedImage === index
                    ? "border-primary"
                    : "border-transparent hover:border-muted"
                )}
              >
                <Image
                  src={image.url}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}
    </div>
  )
}
```

## Metadata & SEO

### Product Page Metadata
```tsx
import { Metadata } from "next"
import { getProduct } from "@/lib/db/products"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)

  return {
    title: `${product.name} | Store`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.images[0].url,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
    },
  }
}
```

### Structured Data (JSON-LD)
```tsx
function ProductJsonLd({ product }: { product: Product }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map(img => img.url),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      price: product.salePrice || product.price,
      priceCurrency: "USD",
      availability: product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

## Accessibility Checklist

- [ ] Product images have descriptive alt text
- [ ] Add to cart button announces success/failure
- [ ] Form fields have proper labels
- [ ] Error messages linked to inputs with aria-describedby
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Screen reader announces price changes
- [ ] Loading states announced
- [ ] Modal dialogs trap focus
- [ ] Skip links for main content
- [ ] Breadcrumb navigation with proper ARIA

## Performance Best Practices

### Image Optimization
```tsx
<Image
  src={product.image}
  alt={product.name}
  width={800}
  height={800}
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={index < 2} // Only prioritize above-fold images
  placeholder="blur"
  blurDataURL={product.imageBlur}
/>
```

### Lazy Loading Reviews
```tsx
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductPage({ params }: Props) {
  return (
    <>
      <ProductDetails product={product} />
      
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviews productId={product.id} />
      </Suspense>
    </>
  )
}
```

### Cart Revalidation
```tsx
// Use optimistic updates for instant feedback
// Revalidate in background
import { useOptimistic } from "react"

export function AddToCartButton({ product }) {
  const [optimisticCart, addOptimistic] = useOptimistic(
    cart,
    (state, product) => [...state, product]
  )

  return (
    <Button onClick={() => addOptimistic(product)}>
      Add to Cart
    </Button>
  )
}
```

## Anti-Patterns to Avoid

❌ **Don't:**
- Use fake urgency ("15 people viewing this")
- Hide extra costs until checkout
- Make return policy hard to find
- Use low-quality or placeholder images
- Create confusing navigation
- Force account creation for checkout
- Use auto-playing videos or music
- Overuse popups and interstitials
- Make CTAs hard to find
- Skip mobile optimization

✅ **Do:**
- Be honest about stock and shipping
- Show all costs early (transparent pricing)
- Make return policy prominent
- Use professional product photography
- Create intuitive, simple navigation
- Offer guest checkout
- Let users browse peacefully
- Use modals sparingly and respectfully
- Make CTAs clear and prominent
- Design mobile-first

---

*Skill Version: 1.0.0*
*Last Updated: 2026-03-24*
