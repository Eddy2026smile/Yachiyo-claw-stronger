import { SettingsPage, SettingsSection } from '@/components/settings/SettingsPage'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { SkillsSection } from '@/components/settings/skills'
import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { installMarketplaceSkill } from '@/lib/skills'

export const Route = createFileRoute('/settings/skills')({
  component: RouteComponent,
})

export function RouteComponent() {
  const { t } = useTranslation()

  const handleSkillInstall = async (skill: any) => {
    if (Capacitor.isNativePlatform()) {
      // Native app handling
      await installMarketplaceSkill(skill)
    } else {
      // Desktop/web handling
      localStorage.setItem(`skill-${skill.id}`, JSON.stringify(skill))
      toast.success(t('Skill installed successfully'))
    }
  }

  return (
    <SettingsPage title={t('Skills')} description={t('Enabled skills will be available in Task mode.')}>
      <SettingsSection>
        <SkillsSection onInstall={handleSkillInstall} />
      </SettingsSection>
    </SettingsPage>
  )
}
