import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  saveRemoteMcpConnection,
  getRemoteMcpConnection,
  createRemoteMcpFetch,
  MockSecureStorage
} from './mcp-http-service'

// Ensure test mode is set
process.env.NODE_ENV = 'test'

describe('Remote MCP Connection', () => {
  let storage: InstanceType<typeof MockSecureStorage>
  
  beforeEach(async () => {
    storage = new MockSecureStorage()
    await storage.clear()
  })

  it('stores and retrieves connection details', async () => {
    const testConn = {
      endpoint: 'https://desktop.example.com/mcp',
      authToken: 'test-token-123'
    }
    
    await saveRemoteMcpConnection(testConn)
    const retrieved = await getRemoteMcpConnection()
    
    expect(retrieved).toEqual(testConn)
  })

  it('creates authenticated fetch for remote', async () => {
    const mockFetch = vi.fn()
    await saveRemoteMcpConnection({
      endpoint: 'https://desktop.example.com/mcp',
      authToken: 'test-token-123'  
    })
    
    const remoteFetch = await createRemoteMcpFetch(mockFetch)
    await remoteFetch('/test')
    
    expect(mockFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        toString: expect.any(Function) // Verify it's a URL-like object
      }),
      {
        headers: {
          Authorization: 'Bearer test-token-123'
        },
        redirect: 'error',
        credentials: 'omit'
      }
    )
    expect(mockFetch.mock.calls[0][0].toString()).toBe('https://desktop.example.com/mcp/test')
  })
})
