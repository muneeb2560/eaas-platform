import { renderWithProviders, screen, fireEvent, waitFor, mockUser } from '../test-utils'
import { Settings } from '@/components/common/Settings'
import { useAuth } from '@/lib/providers/SupabaseProvider'

// Mock the useAuth hook
jest.mock('@/lib/providers/SupabaseProvider', () => ({
  ...jest.requireActual('@/lib/providers/SupabaseProvider'),
  useAuth: jest.fn(),
}))

// Mock the useSignOut hook
jest.mock('@/lib/hooks/useSignOut', () => ({
  useSignOut: () => ({
    handleSignOut: jest.fn(),
    isSigningOut: false,
  }),
}))

describe('Settings Component', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
    })
  })

  it('renders settings button', () => {
    renderWithProviders(<Settings />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('opens dropdown when clicked', async () => {
    renderWithProviders(<Settings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
      expect(screen.getByText('Clear Notifications')).toBeInTheDocument()
      expect(screen.getByText('Export Data')).toBeInTheDocument()
      expect(screen.getByText('Clear Cache')).toBeInTheDocument()
      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })
  })

  it('displays user information in dropdown', async () => {
    renderWithProviders(<Settings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument()
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  it('shows development mode indicator', async () => {
    renderWithProviders(<Settings />)
    
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('🚧 Development Mode')).toBeInTheDocument()
    })
  })

  it('closes dropdown when clicking outside', async () => {
    renderWithProviders(<Settings />)
    
    fireEvent.click(screen.getByRole('button'))
    await waitFor(() => {
      expect(screen.getByText('Profile Settings')).toBeInTheDocument()
    })
    
    fireEvent.mouseDown(document.body)
    await waitFor(() => {
      expect(screen.queryByText('Profile Settings')).not.toBeInTheDocument()
    })
  })
})