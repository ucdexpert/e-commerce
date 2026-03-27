import { render, screen } from '@testing-library/react'
import Header from '@/components/Header'

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
}))

// Mock zustand store
jest.mock('@/store', () => ({
  useStore: () => ({
    cart: [],
    wishlist: [],
    user: null,
    token: null,
  }),
}))

describe('Header', () => {
  it('renders logo/link to home', () => {
    render(<Header />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders navigation links', () => {
    render(<Header />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Shop')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders cart icon', () => {
    render(<Header />)
    // Cart icon should be present
    expect(screen.getByTestId('cart-icon')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<Header />)
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
  })

  it('renders user menu when logged in', () => {
    // Mock logged in state
    jest.mock('@/store', () => ({
      useStore: () => ({
        cart: [],
        wishlist: [],
        user: { email: 'test@test.com' },
        token: 'token',
      }),
    }))
    render(<Header />)
    expect(screen.getByTestId('user-menu')).toBeInTheDocument()
  })
})
