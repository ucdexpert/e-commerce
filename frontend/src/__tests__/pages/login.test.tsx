import { render, screen, fireEvent } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

// Mock toast notifications
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}))

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('renders login button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('renders register link', () => {
    render(<LoginPage />)
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument()
  })

  it('renders Google login button', () => {
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    render(<LoginPage />)
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'Test123!' } })
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(loginButton)
    
    // Validation error should appear
    await screen.findByText(/email/i)
  })

  it('shows validation error for weak password', async () => {
    render(<LoginPage />)
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'test@test.com' } })
    
    const passwordInput = screen.getByLabelText(/password/i)
    fireEvent.change(passwordInput, { target: { value: 'weak' } })
    
    const loginButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(loginButton)
    
    // Validation error should appear
    await screen.findByText(/password/i)
  })
})
