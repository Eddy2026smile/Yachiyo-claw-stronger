import { createFileRoute } from '@tanstack/react-router'
import { DesktopBrainModeSettings } from '@components/settings'

export const Route = createFileRoute('/settings/desktop-brain-mode')({
  component: DesktopBrainModeSettings,
})
