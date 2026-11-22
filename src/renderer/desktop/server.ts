import express from 'express'
import { createMCPProxy } from './mcp-proxy'
import { Request, Response } from 'express'

export function startDesktopServer(port: number, secret: string) {
  const app = express()
  const proxy = createMCPProxy(secret)

  app.use(express.json())
  
  app.post('/mcp', async (req: Request, res: Response) => {
    try {
      const response = await proxy.handle(new Request('http://localhost/mcp', {
        method: 'POST',
        headers: new Headers(req.headers as Record<string, string>),
        body: JSON.stringify(req.body)
      }))
      res.status(response.status).send(await response.text())
    } catch (error) {
      res.status(500).send('Internal Server Error')
    }
  })

  app.listen(port, () => {
    console.log(`Desktop server running on port ${port}`)
  })
}
