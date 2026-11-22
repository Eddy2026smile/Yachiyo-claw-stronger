import { ofetch } from 'ofetch'

export interface MCPProxy {
  handle(request: Request): Promise<Response>
}

export function createMCPProxy(secret: string): MCPProxy {
  return {
    async handle(request: Request) {
      // Verify auth
      const auth = request.headers.get('Authorization')
      if (!auth || !auth.startsWith('Bearer ') || auth.slice(7) !== secret) {
        return new Response('Unauthorized', { status: 401 })
      }

      // Proxy to MCP endpoint
      try {
        const response = await ofetch.raw('https://mcp.modelcontextprotocol.org/v1', {
          method: request.method,
          headers: Object.fromEntries(Array.from(request.headers as Iterable<[string, string]>)),
          body: await request.text()
        })

        return new Response(response._data, {
          status: response.status,
          headers: response.headers
        })
      } catch (error) {
        console.error('MCP Proxy error:', error)
        return new Response('Proxy Error', { status: 502 })
      }
    }
  }
}
