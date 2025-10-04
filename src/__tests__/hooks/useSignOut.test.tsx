import { renderHook, act } from '@testing-library/react'
import { useSignOut } from '@/lib/hooks/useSignOut'
import { useAuth } from '@/lib/providers/SupabaseProvider'
import { useToast } from '@/lib/hooks/useToast'

// Mock the dependencies
jest.mock('@/lib/providers/SupabaseProvider')
jest.mock('@/lib/hooks/useToast')

const mockSignOut = jest.fn()
const mockShowSuccess = jest.fn()
const mockShowError = jest.fn()
const mockShowInfo = jest.fn()

describe('useSignOut Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    ;(useAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    })
    
    ;(useToast as jest.Mock).mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: mockShowError,
      showInfo: mockShowInfo,
    })
  })

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useSignOut())
    
    expect(result.current.isSigningOut).toBe(false)
    expect(typeof result.current.handleSignOut).toBe('function')
  })

  it('should handle successful sign out in development mode', async () => {
    // Mock localStorage
    const mockRemoveItem = jest.fn()
    Object.defineProperty(window, 'localStorage', {
      value: { removeItem: mockRemoveItem },
      writable: true,
    })

    const { result } = renderHook(() => useSignOut())
    
    await act(async () => {
      await result.current.handleSignOut()
    })
    
    expect(mockRemoveItem).toHaveBeenCalledWith('dev-auth-user')
    expect(mockRemoveItem).toHaveBeenCalledWith('dev-user-profile')
    expect(mockSignOut).toHaveBeenCalled()
    expect(mockShowInfo).toHaveBeenCalledWith(
      'Signed Out',
      'You have been signed out (development mode).'
    )
  })

  it('should prevent duplicate sign out attempts', async () => {
    const { result } = renderHook(() => useSignOut())
    
    // Start first sign out
    const firstSignOut = result.current.handleSignOut()
    
    // Try second sign out while first is in progress
    await act(async () => {
      await result.current.handleSignOut()
    })
    
    // Wait for first to complete
    await act(async () => {
      await firstSignOut
    })
    
    // Should only call signOut once
    expect(mockSignOut).toHaveBeenCalledTimes(1)
  })

  it('should handle sign out errors', async () => {
    mockSignOut.mockRejectedValue(new Error('Sign out failed'))
    
    const { result } = renderHook(() => useSignOut())
    
    await act(async () => {
      await result.current.handleSignOut()
    })
    
    expect(mockShowError).toHaveBeenCalledWith(
      'Sign Out Failed',
      'Failed to sign out. Please try again.'
    )
  })
})