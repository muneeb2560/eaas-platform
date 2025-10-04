import { renderWithProviders, screen, waitFor } from '../test-utils'
import Home from '@/app/page'

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
  MockLink.displayName = 'MockLink'
  return MockLink
})

describe('Home Page', () => {
  it('renders main heading after loading', async () => {
    renderWithProviders(<Home />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Evaluation as a Service/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders hero section after loading', async () => {
    renderWithProviders(<Home />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText(/Automated AI model evaluation platform/i)).toBeInTheDocument()
    }, { timeout: 2000 })
  })

  it('renders feature cards after loading', async () => {
    renderWithProviders(<Home />)
    
    // Wait for loading to complete and features to appear
    await waitFor(() => {
      expect(screen.getAllByText(/Custom Rubrics/i)[0]).toBeInTheDocument()
    }, { timeout: 2000 })
    
    expect(screen.getByText(/Automated Processing/i)).toBeInTheDocument()
    expect(screen.getByText(/Comprehensive dashboards with performance trends/i)).toBeInTheDocument()
  })

  it('renders navigation links after loading', async () => {
    renderWithProviders(<Home />)
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
    }, { timeout: 2000 })
    
    expect(screen.getByRole('link', { name: /get started free/i })).toBeInTheDocument()
  })
})