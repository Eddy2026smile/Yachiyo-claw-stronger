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

  it('ensures modals have proper scrolling behavior in flow-glass theme', () => {
    const flowGlassCss = readFileSync(
      join(process.cwd(), 'src/renderer/components/yachiyo/flow-glass.css'),
      'utf8'
    )
    expect(flowGlassCss).toContain('.mantine-Modal-body {')
    expect(flowGlassCss).toContain('overflow-y: auto')
    expect(flowGlassCss).toContain('overscroll-behavior: contain')
  })

  it('allows Agent mode toggle for any model without toolUse capability', () => {
    const agentControls = readFileSync(
      join(process.cwd(), 'src/renderer/components/yachiyo/AgentSessionControls.tsx'),
      'utf8'
    )
    expect(agentControls).toContain('// Skip configuration check and allow enabling Agent for any model')
    expect(agentControls).toContain('configured: true, // Force as configured')
  })

  it('handles SkillHub item clicks properly on desktop', () => {
    const skillsSection = readFileSync(
      join(process.cwd(), 'src/renderer/components/settings/skills/SkillsSection.tsx'),
      'utf8'
    )
    expect(skillsSection).toContain('localStorage.setItem(\'desktopSkills\'')
    expect(skillsSection).toContain('toast.success(t(\'Installed "{{name}}"\'')
    expect(skillsSection).toContain('toast.success(t(\'Skill deleted\')')
    expect(skillsSection).toContain('toast.success(t(\'Update available for {{name}}\'')
  })

  it('prevents duplicate skill installations on desktop', () => {
    const skillsSection = readFileSync(
      join(process.cwd(), 'src/renderer/components/settings/skills/SkillsSection.tsx'),
      'utf8'
    )
    expect(skillsSection).toContain('s.id === skill.id')
    expect(skillsSection).toContain('s.name === skill.name')
    expect(skillsSection).toContain('(s.slug && s.slug === skill.slug)')
  })

  it('handles GitHub 404 errors gracefully in GitHubInstallModal', () => {
    const modal = readFileSync(
      join(process.cwd(), 'src/renderer/components/settings/skills/GitHubInstallModal.tsx'),
      'utf8'
    )
    expect(modal).toContain('(error as any)?.response?.status !== 404')
  })

  it('positions toasts above bottom navigation in flow-glass theme', () => {
    const flowGlassCss = readFileSync(
      join(process.cwd(), 'src/renderer/components/yachiyo/flow-glass.css'),
      'utf8'
    )
    expect(flowGlassCss).toContain('.sonner-toast {')
    expect(flowGlassCss).toContain('bottom: 88px !important')
    expect(flowGlassCss).toContain('z-index: 9999 !important')
  })

  it('exposes Android ADB tools via MCP server', () => {
    const mcpServer = readFileSync(
      join(process.cwd(), 'src/renderer/desktop/mcp-server.ts'),
      'utf8'
    )
    expect(mcpServer).toContain('/tools/list')
    expect(mcpServer).toContain('/tools/call')
    expect(mcpServer).toContain('adb devices -l')
    expect(mcpServer).toContain('adb exec-out screencap -p')
    expect(mcpServer).toContain('adb exec-out uiautomator dump')
    expect(mcpServer).toContain('adb shell input tap')
    expect(mcpServer).toContain('adb shell input text')
    expect(mcpServer).toContain('adb logcat -d -t 100')
    expect(mcpServer).toContain('adb install -r')
  })
})
