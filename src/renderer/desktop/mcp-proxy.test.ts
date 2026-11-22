import { describe, expect, it, vi } from 'vitest'
import { createMCPProxy } from './mcp-proxy'

describe('MCP Proxy', () => {
  it('should reject requests without auth', async () => {
    const proxy = createMCPProxy('test-secret')
    const req = new Request('http://localhost:8080/mcp', {
      method: 'POST'
    })
    const res = await proxy.handle(req)
    expect(res.status).toBe(401)
  })

  it('should proxy requests with valid auth', async () => {
    const proxy = createMCPProxy('test-secret')
    const mockFetch = vi.fn().mockResolvedValue(new Response('test'))
    global.fetch = mockFetch

    const req = new Request('http://localhost:8080/mcp', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-secret'
      },
      body: JSON.stringify({ test: true })
    })

    const res = await proxy.handle(req)
    expect(await res.text()).toBe('test')
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mcp.modelcontextprotocol.org/v1',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ test: true })
      })
    )
  })
})
