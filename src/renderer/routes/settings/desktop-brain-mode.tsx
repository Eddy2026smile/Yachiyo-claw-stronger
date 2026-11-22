import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage'
import { createFileRoute } from '@tanstack/react-router'
import { DesktopBrainModeSettings } from '@/components/settings/DesktopBrainModeSettings'

export const Route = createFileRoute('/settings/desktop-brain-mode')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SettingsPage title="Desktop Brain Mode" description="Local MCP server and Tailscale connectivity">
      <SettingsSection>
        <DesktopBrainModeSettings />
      </SettingsSection>
    </SettingsPage>
  )
}
