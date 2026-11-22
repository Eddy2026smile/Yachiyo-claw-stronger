import { createMCPProxy } from './mcp-proxy'

export function startDesktopServer(port: number, secret: string) {
  const proxy = createMCPProxy(secret)
  
  Bun.serve({
    port,
    async fetch(req) {
      const url = new URL(req.url)
      if (url.pathname === '/mcp') {
        return proxy.handle(req)
      }
      return new Response('Not Found', { status: 404 })
    }
  })

  console.log(`Desktop server running on port ${port}`)
}
