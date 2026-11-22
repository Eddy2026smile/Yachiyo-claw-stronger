import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseServersFromJson } from '../components/settings/mcp/utils'

describe('Desktop & Cross-Platform Smoke Checks', () => {
  it('never passes undefined components prop to Virtuoso in MessageList', () => {
    const src = readFileSync(join(process.cwd(), 'src/renderer/components/chat/MessageList.tsx'), 'utf8')
    expect(src).not.toContain('components={inAndroidAppShell ? androidMessageListComponents : undefined}')
  })

  it('parses Desktop Brain Mode connection strings and standard MCP JSON', () => {
    const brain = parseServersFromJson('http://100.64.0 | Bearer test-token-123')
    expect(brain).toHaveLength(1)
    expect(brain[0].transport.type).toBe('http')

    const json = parseServersFromJson(
      JSON.stringify({ mcpServers: { n8n: { url: 'https://n8n.cloud' } } })
    )
    expect(json).toHaveLength(1)
    expect(json[0].name).toBe('n8n')
  })
})
