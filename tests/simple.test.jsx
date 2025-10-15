import { render, screen } from '@testing-library/react'

// Test simple para verificar configuración
describe('Test Configuration', () => {
  test('Jest and React Testing Library work correctly', () => {
    render(<div>Hello Test</div>)
    expect(screen.getByText('Hello Test')).toBeInTheDocument()
  })
  
  test('can handle basic calculations', () => {
    const sum = (a, b) => a + b
    expect(sum(2, 3)).toBe(5)
  })
  
  test('can handle mock functions', () => {
    const mockFn = jest.fn()
    mockFn('test')
    expect(mockFn).toHaveBeenCalledWith('test')
  })
})
