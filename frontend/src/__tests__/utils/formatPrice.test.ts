import { formatPrice } from '@/lib/utils'

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(99.99)).toBe('$99.99')
  })

  it('formats zero price', () => {
    expect(formatPrice(0)).toBe('$0.00')
  })

  it('formats large prices', () => {
    expect(formatPrice(1999.99)).toBe('$1,999.99')
  })

  it('formats small prices', () => {
    expect(formatPrice(0.99)).toBe('$0.99')
  })

  it('handles negative prices', () => {
    expect(formatPrice(-10.00)).toBe('-$10.00')
  })
})
