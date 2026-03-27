---
name: ecommerce-seo-developer
description: Expert Next.js 16 + TypeScript E-commerce SEO specialist for technical SEO, structured data, Core Web Vitals, and organic growth
version: 1.0.0
triggers:
  - ecommerce seo
  - product seo
  - schema markup
  - metadata
  - sitemap
  - robots.txt
  - structured data
  - next.js seo
  - product page seo
  - category seo
  - rich snippets
  - core web vitals
  - canonical
  - og image
---

# E-commerce SEO Developer Skill

Expert Next.js 16 (App Router) + TypeScript E-commerce SEO specialist. Generates production-ready, SEO-optimized code and configurations for online stores. Focuses on technical SEO, on-page SEO, structured data, performance (Core Web Vitals), crawlability, and rich snippets to improve Google rankings and organic traffic for e-commerce websites.

## Core Responsibilities

### 1. Dynamic Metadata Generation
- Title tags with proper length (50-60 characters)
- Meta descriptions (150-160 characters)
- Open Graph tags for social sharing
- Twitter Cards for enhanced previews
- Canonical URLs to prevent duplicate content
- Noindex handling for thin content pages
- Robots meta tags

### 2. Structured Data (JSON-LD)
- Product schema with price, availability, reviews
- Offer schema for variants and pricing
- AggregateRating for review stars in SERPs
- BreadcrumbList for navigation rich snippets
- Organization schema for brand identity
- FAQPage for product FAQs
- Review schema for user-generated content
- CollectionPage for category pages

### 3. Technical SEO
- Dynamic sitemap.xml generation
- robots.txt configuration
- Image optimization with next/image
- Proper alt text and image sitemaps
- Core Web Vitals optimization (LCP, INP, CLS)
- Server-side rendering for crawlability
- ISR (Incremental Static Regeneration) strategy
- Crawl budget optimization

### 4. On-Page SEO
- SEO-friendly URL structures
- Heading hierarchy (H1, H2, H3)
- Internal linking strategies
- Breadcrumb navigation
- Keyword optimization in copy
- Content length recommendations
- E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness)

### 5. E-commerce Specific SEO
- Product variant handling without duplicate content
- Out-of-stock page strategies (keep indexed or noindex)
- Price and availability markup
- Review and rating schema
- Category pagination with rel=prev/next
- Filter and sort parameter handling
- Seasonal product strategies

## File Structure

```
app/
├── (shop)/
│   ├── page.tsx                      # Homepage with metadata
│   ├── layout.tsx                    # Shared layout with SEO
│   ├── products/
│   │   ├── [slug]/
│   │   │   ├── page.tsx              # Product detail with JSON-LD
│   │   │   ├── loading.tsx
│   │   │   ├── opengraph-image.tsx   # Dynamic OG image
│   │   │   └── product-jsonld.tsx    # Product schema component
│   │   └── page.tsx                  # All products listing
│   ├── category/
│   │   ├── [slug]/
│   │   │   ├── page.tsx              # Category with BreadcrumbList
│   │   │   ├── loading.tsx
│   │   │   └── category-jsonld.tsx
│   │   └── page.tsx
│   ├── collection/
│   │   └── [slug]/
│   │       └── page.tsx              # Curated collections
│   ├── search/
│   │   └── page.tsx                  # Search results (noindex)
│   └── cart/
│       └── page.tsx                  # Cart (noindex)
├── (checkout)/
│   ├── checkout/
│   │   └── page.tsx                  # Checkout (noindex, secure)
│   └── layout.tsx
├── (account)/
│   ├── account/
│   │   └── page.tsx                  # Account dashboard (noindex)
│   └── login/
│       └── page.tsx
├── api/
│   ├── sitemap/
│   │   └── route.ts                  # Dynamic sitemap.xml
│   └── robots/
│       └── route.ts                  # Dynamic robots.txt
├── components/
│   ├── seo/
│   │   ├── json-ld.tsx               # Generic JSON-LD wrapper
│   │   ├── product-schema.tsx        # Product schema generator
│   │   ├── breadcrumb-schema.tsx     # BreadcrumbList schema
│   │   ├── organization-schema.tsx   # Organization schema
│   │   ├── faq-schema.tsx            # FAQPage schema
│   │   └── review-schema.tsx         # Review schema
│   ├── shared/
│   │   ├── breadcrumb.tsx            # Visible breadcrumb nav
│   │   └── social-share.tsx          # OG preview component
│   └── ui/
├── lib/
│   ├── seo/
│   │   ├── metadata.ts               # Metadata utilities
│   │   ├── sitemap.ts                # Sitemap generation
│   │   ├── schema-generators.ts      # JSON-LD generators
│   │   ├── canonical.ts              # Canonical URL helpers
│   │   └── og-image.ts               # OG image generation
│   ├── utils/
│   │   ├── formatters.ts
│   │   └── slug-generator.ts
│   └── constants.ts
├── types/
│   ├── seo.ts                        # SEO type definitions
│   ├── product.ts
│   └── schema.ts
├── robots.ts                         # Next.js 16 robots.txt
├── sitemap.ts                        # Next.js 16 sitemap.ts
└── styles/
    └── globals.css
```

## Implementation Examples

### 1. Product Page with Complete SEO

```tsx
// app/products/[slug]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProduct, getRelatedProducts } from "@/lib/db/products"
import { ProductJsonLd } from "./product-jsonld"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import ProductGallery from "@/components/product/product-gallery"
import ProductInfo from "@/components/product/product-info"
import ProductReviews from "@/components/product/product-reviews"
import RelatedProducts from "@/components/product/related-products"

interface Props {
  params: { slug: string }
}

// Dynamic Metadata Generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  
  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title = `${product.name} | Your Store`
  const description = product.metaDescription || 
    `${product.description.substring(0, 155)}...`

  return {
    title: {
      default: title,
      template: "%s | Your Store",
    },
    description,
    keywords: [
      product.name,
      product.category?.name,
      product.brand,
      ...product.tags,
      "buy online",
      "free shipping",
    ].slice(0, 10), // Max 10 keywords
    authors: [{ name: "Your Store" }],
    canonical: `https://yourstore.com/products/${product.slug}`,
    openGraph: {
      title,
      description,
      type: "product",
      locale: "en_US",
      siteName: "Your Store",
      url: `https://yourstore.com/products/${product.slug}`,
      images: [
        {
          url: product.images[0].url,
          width: 1200,
          height: 630,
          alt: product.name,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.images[0].url],
      creator: "@yourstore",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Alternative languages (if multi-language)
    // alternates: {
    //   canonical: `https://yourstore.com/products/${product.slug}`,
    //   languages: {
    //     "en-US": "https://yourstore.com/products/${product.slug}",
    //     "es-ES": "https://yourstore.com/es/products/${product.slug}",
    //   },
    // },
  }
}

// Generate static params for SSG/ISR
export async function generateStaticParams() {
  const products = await getAllProductSlugs()
  
  return products.map((product) => ({
    slug: product.slug,
  }))
}

// Product Page Component
export default async function ProductPage({ params }: Props) {
  const product = await getProduct(params.slug)
  
  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, 4)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <ProductJsonLd product={product} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: product.category?.name || "Products", href: `/category/${product.category?.slug}` },
            { name: product.name, href: `/products/${product.slug}` },
          ]}
        />

        {/* Product Content */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <ProductGallery images={product.images} productName={product.name} />
          <ProductInfo product={product} />
        </div>

        {/* Reviews Section */}
        {product.reviewsEnabled && (
          <section className="mt-16" aria-label="Customer Reviews">
            <h2 className="text-3xl font-bold mb-8">Customer Reviews</h2>
            <ProductReviews productId={product.id} />
          </section>
        )}

        {/* Related Products */}
        <section className="mt-16" aria-label="Related Products">
          <h2 className="text-3xl font-bold mb-8">You May Also Like</h2>
          <RelatedProducts products={relatedProducts} />
        </section>
      </main>
    </>
  )
}
```

### 2. Product JSON-LD Schema Component

```tsx
// app/products/[slug]/product-jsonld.tsx
import { Product } from "@/types/product"
import { JsonLd } from "@/components/seo/json-ld"

interface ProductJsonLdProps {
  product: Product
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://yourstore.com"
  
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${baseUrl}/products/${product.slug}`,
    name: product.name,
    description: product.description,
    image: product.images.map(img => `${baseUrl}${img.url}`),
    sku: product.sku,
    mpn: product.mpn,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      "@id": `${baseUrl}/products/${product.slug}#offer`,
      url: `${baseUrl}/products/${product.slug}`,
      price: product.salePrice || product.price,
      priceCurrency: "USD",
      priceValidUntil: product.saleEndDate 
        ? new Date(product.saleEndDate).toISOString().split("T")[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: `https://schema.org/${product.condition || "NewCondition"}`,
      availability: product.stock > 0 
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Your Store",
        url: baseUrl,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.freeShipping ? "0" : "9.99",
          currency: "USD",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 5,
            unitCode: "d",
          },
        },
      },
    },
    aggregateRating: product.rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: product.rating.toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: "5",
      worstRating: "1",
    } : undefined,
    review: product.reviews?.slice(0, 5).map(review => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating.toString(),
        bestRating: "5",
        worstRating: "1",
      },
      author: {
        "@type": "Person",
        name: review.customerName,
      },
      datePublished: new Date(review.createdAt).toISOString().split("T")[0],
      reviewBody: review.comment,
    })),
    hasVariant: product.variants?.map(variant => ({
      "@type": "Product",
      "@id": `${baseUrl}/products/${product.slug}#${variant.id}`,
      name: `${product.name} - ${variant.name}`,
      sku: variant.sku,
      offers: {
        "@type": "Offer",
        price: variant.price,
        priceCurrency: "USD",
        availability: variant.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    })),
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Material",
        value: product.material,
      },
      {
        "@type": "PropertyValue",
        name: "Color",
        value: product.color,
      },
      {
        "@type": "PropertyValue",
        name: "Weight",
        value: product.weight,
        unitCode: "GRM",
      },
    ].filter(prop => prop.value),
  }

  // FAQ Schema (if product has FAQs)
  const faqSchema = product.faqs && product.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } : undefined

  return (
    <>
      <JsonLd schema={productSchema} />
      {faqSchema && <JsonLd schema={faqSchema} />}
    </>
  )
}
```

### 3. Generic JSON-LD Wrapper Component

```tsx
// components/seo/json-ld.tsx
interface JsonLdProps {
  schema: Record<string, any>
}

export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 4. Dynamic Sitemap Generation

```ts
// app/sitemap.ts
import { MetadataRoute } from "next"
import { getAllProducts } from "@/lib/db/products"
import { getAllCategories } from "@/lib/db/categories"
import { getAllCollections } from "@/lib/db/collections"

const baseUrl = process.env.NEXT_PUBLIC_URL || "https://yourstore.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
  ]

  // Product pages
  const products = await getAllProducts()
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  // Category pages
  const categories = await getAllCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(category.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  // Collection pages
  const collections = await getAllCollections()
  const collectionPages: MetadataRoute.Sitemap = collections.map((collection) => ({
    url: `${baseUrl}/collection/${collection.slug}`,
    lastModified: new Date(collection.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages]
}
```

### 5. Robots.txt Configuration

```ts
// app/robots.ts
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://yourstore.com"
  
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/products/",
          "/category/",
          "/collection/",
          "/blog/",
          "/about",
          "/contact",
        ],
        disallow: [
          "/api/",
          "/cart",
          "/checkout",
          "/account",
          "/search",
          "/admin",
          "/404",
          "/500",
          "/*?*sort=", // Sort parameters create duplicates
          "/*?*filter=", // Filter parameters
          "/*?*page=", // Pagination handled by canonical
        ],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/products/",
          "/category/",
        ],
        disallow: [
          "/checkout",
          "/account",
          "/cart",
        ],
        // Allow Google to use more resources
        crawlDelay: 0,
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/sitemap-products.xml`, // Optional: separate product sitemap
      `${baseUrl}/sitemap-categories.xml`,
    ],
    host: baseUrl,
  }
}
```

### 6. Breadcrumb Component with Schema

```tsx
// components/shared/breadcrumb.tsx
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BreadcrumbJsonLd } from "@/components/seo/breadcrumb-schema"

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <>
      {/* JSON-LD for Breadcrumbs */}
      <BreadcrumbJsonLd items={items} />
      
      {/* Visible Breadcrumb */}
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm ${className || ""}`}
      >
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
              )}
              {index === items.length - 1 ? (
                <span 
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
```

### 7. Breadcrumb Schema Generator

```tsx
// components/seo/breadcrumb-schema.tsx
import { JsonLd } from "./json-ld"

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || "https://yourstore.com"
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.href}`,
    })),
  }

  return <JsonLd schema={schema} />
}
```

### 8. Image Optimization Helper

```ts
// lib/seo/image-optimization.ts
import { ImageProps } from "next/image"

interface SEOOptimizedImageProps extends Partial<ImageProps> {
  alt: string
  priority?: boolean
  sizes?: string
}

export function getSEOOptimizedImageProps(
  alt: string,
  options?: Partial<SEOOptimizedImageProps>
): SEOOptimizedImageProps {
  return {
    alt,
    priority: options?.priority || false,
    sizes: options?.sizes || "(max-width: 768px) 100vw, 50vw",
    loading: options?.priority ? "eager" : "lazy",
    fetchPriority: options?.priority ? "high" : "auto",
    ...options,
  }
}

// Usage in component:
// <Image 
//   {...getSEOOptimizedImageProps(product.name, { 
//     priority: true,
//     sizes: "(max-width: 768px) 100vw, 50vw"
//   })}
// />
```

### 9. Organization Schema

```tsx
// components/seo/organization-schema.tsx
import { JsonLd } from "./json-ld"

interface OrganizationSchemaProps {
  name: string
  url: string
  logo: string
  description: string
  socialProfiles?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  contactInfo?: {
    email: string
    phone: string
    address: string
  }
}

export function OrganizationJsonLd({ 
  name, 
  url, 
  logo, 
  description,
  socialProfiles,
  contactInfo 
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": url,
    name,
    url,
    logo: {
      "@type": "ImageObject",
      url: `${url}${logo}`,
      width: 600,
      height: 60,
    },
    description,
    sameAs: [
      socialProfiles?.facebook,
      socialProfiles?.twitter,
      socialProfiles?.instagram,
      socialProfiles?.linkedin,
      socialProfiles?.youtube,
    ].filter(Boolean),
    contactPoint: contactInfo ? {
      "@type": "ContactPoint",
      email: contactInfo.email,
      telephone: contactInfo.phone,
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    } : undefined,
    address: contactInfo?.address ? {
      "@type": "PostalAddress",
      streetAddress: contactInfo.address,
    } : undefined,
  }

  return <JsonLd schema={schema} />
}
```

### 10. Core Web Vitals Optimization

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // Prevent layout shift
  interactiveWidget: "resizes-visual",
}

export const metadata: Metadata = {
  // ... your metadata
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.yourstore.com" />
        
        {/* DNS prefetch for analytics */}
        <link rel="dns-prefetch" href="https://analytics.google.com" />
      </head>
      <body className="antialiased">
        {/* Critical CSS inline, rest loaded async */}
        {children}
        
        {/* Performance monitoring */}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

### 11. Category Page SEO

```tsx
// app/category/[slug]/page.tsx
import { Metadata } from "next"
import { getCategory } from "@/lib/db/categories"
import { CategoryJsonLd } from "./category-jsonld"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import ProductGrid from "@/components/category/product-grid"

interface Props {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory(params.slug)
  
  if (!category) {
    return {
      title: "Category Not Found",
      robots: { index: false },
    }
  }

  const page = Number(params.slug) || 1
  const pageTitle = page > 1 
    ? `${category.name} - Page ${page} | Your Store`
    : `${category.name} | Your Store`

  return {
    title: pageTitle,
    description: category.metaDescription || category.description,
    canonical: page > 1 
      ? `https://yourstore.com/category/${params.slug}?page=${page}`
      : `https://yourstore.com/category/${params.slug}`,
    openGraph: {
      title: pageTitle,
      description: category.description,
      type: "website",
      images: category.image 
        ? [{ url: category.image, width: 1200, height: 630 }]
        : undefined,
    },
    // Pagination handling
    alternates: {
      canonical: `https://yourstore.com/category/${params.slug}`,
      types: {
        "application/rss+xml": `https://yourstore.com/category/${params.slug}/feed.xml`,
      },
    },
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategory(params.slug)
  const page = Number(searchParams.page) || 1

  if (!category) {
    notFound()
  }

  return (
    <>
      <CategoryJsonLd category={category} />
      
      <main className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { name: "Home", href: "/" },
            { name: category.name, href: `/category/${category.slug}` },
          ]}
        />
        
        <div className="mt-8">
          <h1 className="text-4xl font-bold">{category.name}</h1>
          
          {/* SEO Content */}
          {category.description && (
            <div 
              className="mt-4 prose max-w-none"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          )}
          
          {/* Product Grid */}
          <ProductGrid categoryId={category.id} page={page} />
        </div>
      </main>
    </>
  )
}
```

## SEO Checklist

### Product Pages
- [ ] Unique, descriptive title tag (50-60 chars)
- [ ] Compelling meta description (150-160 chars)
- [ ] Product JSON-LD with price, availability, reviews
- [ ] AggregateRating schema for review stars
- [ ] BreadcrumbList schema
- [ ] Canonical URL set
- [ ] Optimized images with alt text
- [ ] H1 with product name
- [ ] Proper heading hierarchy
- [ ] Internal links to related products
- [ ] FAQ schema if FAQs exist
- [ ] Open Graph tags for social sharing
- [ ] Mobile-friendly layout
- [ ] Fast LCP (<2.5s)
- [ ] Low CLS (<0.1)

### Category Pages
- [ ] Unique category title
- [ ] Descriptive meta description
- [ ] Category schema (CollectionPage)
- [ ] Breadcrumb schema
- [ ] Pagination handling (rel=prev/next or canonical)
- [ ] Filter parameters don't create duplicates
- [ ] SEO content at top or bottom
- [ ] Internal links to subcategories
- [ ] Product count visible

### Technical SEO
- [ ] sitemap.xml generated and submitted
- [ ] robots.txt configured correctly
- [ ] No indexation of cart/checkout/account
- [ ] 404 page customized
- [ ] 301 redirects for old URLs
- [ ] HTTPS enforced
- [ ] Mobile-responsive design
- [ ] Core Web Vitals passing
- [ ] No broken links
- [ ] Image sitemaps for product images

## Performance Optimization

### LCP (Largest Contentful Paint)
- Prioritize hero images with `priority` prop
- Use next/image with proper sizes
- Implement font preloading
- Server-side render critical content
- Use Edge caching

### INP (Interaction to Next Paint)
- Minimize JavaScript bundle
- Use React Server Components
- Debounce search inputs
- Lazy load non-critical components
- Optimize event handlers

### CLS (Cumulative Layout Shift)
- Define image dimensions
- Use skeleton loaders
- Reserve space for dynamic content
- Load fonts with `font-display: swap`
- Avoid injecting content above existing content

---

*Skill Version: 1.0.0*
*Last Updated: 2026-03-24*
