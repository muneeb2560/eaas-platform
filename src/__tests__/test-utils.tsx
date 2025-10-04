import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SupabaseProvider } from '@/lib/providers/SupabaseProvider'
import { NotificationProvider } from '@/lib/providers/NotificationProvider'
import { ToastProvider } from '@/lib/providers/ToastProvider'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseProvider>
      <NotificationProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </NotificationProvider>
    </SupabaseProvider>
  )
}

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
    avatar_url: '',
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
  role: 'authenticated',
}

// Mock session data
export const mockSession = {
  access_token: 'mock-token',
  refresh_token: 'mock-refresh',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: mockUser,
}

// Helper functions
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper })
}

export const waitForLoadingToFinish = () => {
  return waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  }, { timeout: 3000 })
}

export { screen, fireEvent, waitFor }