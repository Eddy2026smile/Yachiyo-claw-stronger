import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  saveRemoteMcpConnection,
  getRemoteMcpConnection,
  createRemoteMcpFetch
} from './mcp-http-service'
import { SecureStorage } from '../platform/storages.mobile-secure'

describe('Remote MCP Connection', () => {
  beforeEach(async () => {
    // Clear storage between tests
    const storage = new SecureStorage('mcp_remote_connection')
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
    
    const remoteFetch = createRemoteMcpFetch(mockFetch)
    await remoteFetch('/test')
    
    expect(mockFetch).toHaveBeenCalledWith(
      'https://desktop.example.com/mcp/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token-123'
        })
      })
    )
  })
})
