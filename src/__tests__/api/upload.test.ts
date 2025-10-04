/**
 * @jest-environment node
 */
/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/upload/dataset/route'

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createRouteHandlerClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
    storage: {
      from: () => ({
        upload: jest.fn().mockResolvedValue({
          data: { path: 'test-path' },
          error: null,
        }),
      }),
    },
  }),
}))

describe('/api/upload/dataset', () => {
  it('should handle file upload in development mode', async () => {
    // Mock FormData with a file
    const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload/dataset', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.filename).toBe('test.csv')
  })

  it('should reject non-CSV files', async () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const formData = new FormData()
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload/dataset', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Only CSV and JSON files are allowed')
  })

  it('should reject files that are too large', async () => {
    // Create a mock file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024) // 11MB
    const mockFile = new File([largeContent], 'large.csv', { type: 'text/csv' })
    const formData = new FormData()
    formData.append('file', mockFile)

    const request = new NextRequest('http://localhost:3000/api/upload/dataset', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('File size must be less than 10MB')
  })

  it('should handle missing file', async () => {
    const formData = new FormData()

    const request = new NextRequest('http://localhost:3000/api/upload/dataset', {
      method: 'POST',
      body: formData,
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('No file provided')
  })
})