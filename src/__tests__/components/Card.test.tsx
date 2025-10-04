import { renderWithProviders, screen, fireEvent, waitFor } from '../test-utils'
import { Card } from '@/components/ui/Card'

describe('Card Component', () => {
  it('renders card with children', () => {
    renderWithProviders(
      <Card>
        <p>Card content</p>
      </Card>
    )
    
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    renderWithProviders(
      <Card className="custom-class">
        <p>Card content</p>
      </Card>
    )
    
    const card = screen.getByText('Card content').closest('div')
    expect(card).toHaveClass('custom-class')
  })

  it('has default styling classes', () => {
    renderWithProviders(
      <Card>
        <p>Card content</p>
      </Card>
    )
    
    const card = screen.getByText('Card content').closest('div')
    expect(card).toHaveClass('bg-gray-800/50', 'rounded-lg', 'border')
  })
})