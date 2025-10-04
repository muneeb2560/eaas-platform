import { renderWithProviders, screen, fireEvent, waitFor } from '../test-utils'
import { Button } from '@/components/ui/Button'

describe('Button Component', () => {
  it('renders button with default props', () => {
    renderWithProviders(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    renderWithProviders(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    renderWithProviders(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies different variants correctly', () => {
    const { rerender } = renderWithProviders(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border')
    
    rerender(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('text-gray-300')
  })

  it('applies different sizes correctly', () => {
    const { rerender } = renderWithProviders(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-8', 'px-3')
    
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-10', 'px-6')
  })
})