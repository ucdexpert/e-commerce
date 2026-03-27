import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

async function getProducts() {
  try {
    if (!API_URL || !API_URL.startsWith('http')) {
      console.warn('API_URL not configured, skipping product sitemap')
      return []
    }
    const res = await fetch(
      `${API_URL}/products/?per_page=500&is_active=true`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.products || []
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
    return []
  }
}

async function getCategories() {
  try {
    if (!API_URL || !API_URL.startsWith('http')) {
      console.warn('API_URL not configured, skipping category sitemap')
      return []
    }
    const res = await fetch(
      `${API_URL}/categories/all`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    return await res.json() || []
  } catch (error) {
    console.error('Failed to fetch categories for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com'
  const products = await getProducts()
  const categories = await getCategories()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/flash-sales`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  const productPages: MetadataRoute.Sitemap = products.map((p: any) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updated_at || p.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const categoryPages: MetadataRoute.Sitemap = categories.map((c: any) => ({
    url: `${baseUrl}/products?category=${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...productPages, ...categoryPages]
}
