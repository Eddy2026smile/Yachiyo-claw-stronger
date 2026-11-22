import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { McpHttpService } from '../mobile/mcp-http-service'
import { URL } from 'url'

export interface DesktopMcpServer {
  start(): Promise<void>
  stop(): Promise<void>
}

export function createDesktopMcpServer(
  port = 8080, 
  secret: string,
  options?: {
    allowLan?: boolean
    allowedHosts?: string[]
  }
): DesktopMcpServer {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      // Verify authorization
      const auth = req.headers.authorization?.replace(/^Bearer /, '')
      if (auth !== secret) {
        res.writeHead(401).end()
        return
      }

      // Handle CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id',
        }).end()
        return
      }

      // Create MCP service instance
      const service = new McpHttpService({
        endpoint: `http://localhost:${port}/mcp`, // Base URL will be overridden per request
        policy: { 
          allowLan: options?.allowLan,
          allowedHosts: options?.allowedHosts 
        },
        fetchImpl: async (input, init) => {
          // Convert to absolute URL
          const url = new URL(input.toString(), `http://localhost:${port}`)
          return fetch(url, init)
        }
      })

      // Handle requests
      if (req.method === 'POST') {
        let body = ''
        for await (const chunk of req) {
          body += chunk
        }
        
        const result = await service.call(JSON.parse(body))
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }).end(JSON.stringify(result))
      } else if (req.method === 'DELETE') {
        await service.close()
        res.writeHead(204, {
          'Access-Control-Allow-Origin': '*'
        }).end()
      } else {
        res.writeHead(405).end()
      }
    } catch (err) {
      console.error('MCP Server Error:', err)
      res.writeHead(500).end()
    }
  })

  return {
    start: () => new Promise(resolve => {
      server.listen(port, () => {
        console.log(`MCP Server running on port ${port}`)
        resolve()
      })
    }),
    stop: () => new Promise((resolve, reject) => {
      server.close(err => err ? reject(err) : resolve())
    })
  }
}
