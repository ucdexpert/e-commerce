import { render, screen } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'

const mockProduct = {
  id: 1,
  name: 'Test Product',
  slug: 'test-product',
  price: 99.99,
  compare_price: 129.99,
  cost: 50.00,
  sku: 'TEST-001',
  stock_quantity: 10,
  rating: 4.5,
  review_count: 10,
  sold_count: 50,
  view_count: 100,
  is_active: true,
  is_featured: false,
  is_on_sale: true,
  images: [],
  short_description: 'Test product description',
  description: 'Full product description',
  categories: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/99\.99/)).toBeInTheDocument()
  })

  it('renders sale badge when product is on sale', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('SALE')).toBeInTheDocument()
  })

  it('renders star rating', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('renders review count', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('(10 reviews)')).toBeInTheDocument()
  })

  it('renders add to cart button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Add to Cart')).toBeInTheDocument()
  })

  it('renders wishlist button', () => {
    render(<ProductCard product={mockProduct} />)
    // Wishlist button should be present (heart icon)
    expect(screen.getByTestId('wishlist-button')).toBeInTheDocument()
  })

  it('renders compare button', () => {
    render(<ProductCard product={mockProduct} />)
    // Compare button should be present
    expect(screen.getByTestId('compare-button')).toBeInTheDocument()
  })

  it('shows out of stock when stock_quantity is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock_quantity: 0 }
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} />)
    const link = screen.getByRole('link', { name: /test product/i })
    expect(link).toHaveAttribute('href', '/products/test-product')
  })
})
