import { ActionIcon, Alert, Button, SegmentedControl, Stack, Switch, Text, Title, Tooltip } from '@mantine/core'
import { IconAdjustments, IconAlertTriangle, IconBolt, IconCheck, IconPlus, IconShieldLock } from '@tabler/icons-react'
import { sessionsStore } from '@/mobile/sessions-store'
import { getCharacterById } from '@/mobile/character-store'

interface Copilot {
  id: string
  name: string
  systemPrompt?: string
  characterId?: string
  active?: boolean
}

const copilots: Copilot[] = [
  { 
    id: 'default', 
    name: 'Yachiyo Claw',
    systemPrompt: 'You are Yachiyo Claw, an AI assistant...' // Default system prompt
  },
  { 
    id: 'tool', 
    name: 'Tool Agent',
    systemPrompt: 'You are a tool-using agent...' 
  },
  { 
    id: 'character1', 
    name: 'Character Card 1',
    characterId: 'char1'
  },
  { 
    id: 'character2', 
    name: 'Character Card 2',
    characterId: 'char2'
  }
]

const setActiveCopilot = (sessionId: string, copilot: Copilot) => {
  const character = copilot.characterId ? getCharacterById(copilot.characterId) : null
  sessionsStore.updateSession(sessionId, {
    copilotId: copilot.id,
    characterId: copilot.characterId,
    name: copilot.name,
    assistantAvatarKey: character?.avatar || undefined,
    settings: {
      systemPrompt: copilot.systemPrompt || '',
      assistantName: copilot.name
    }
  })
}
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Capacitor } from '@capacitor/core'
import { join } from 'node:path'
import { createDesktopMcpServer, generateRandomSecret } from '../../desktop/mcp-server'
import { AdaptiveModal } from '@/components/common/AdaptiveModal'
import {
  type AgentBackend,
  getAgentBackend,
  getCachedRootCapability,
  getRootCapability,
  setAgentBackend,
} from '@/mobile/agent-broker'
import { type AgentApprovalMode, getAgentSessionConfig, saveAgentSessionConfig } from '@/mobile/agent-session-config'
import { getAgentRuntimeSettings, saveAgentRuntimeSettings } from '@/mobile/agent-runtime-settings'
import { AgentConfigurationPanel } from './AgentConfigurationPanel'
import { type DevicePermissionStatus, yachiyoDeviceAccessNative } from '@/platform/native/yachiyo_device_access'
import { AdaptiveActionCluster, type AdaptiveActionDescriptor } from './AdaptiveActionCluster'

const APPROVAL_OPTIONS = [
  { value: 'manual', label: '手动审批' },
  { value: 'smart', label: 'AI 预审' },
  { value: 'full', label: '完全控制' },
]

const APPROVAL_LABEL: Record<AgentApprovalMode, string> = {
  manual: '手动审批',
  smart: 'AI 预审',
  full: '完全控制',
}

export function describeAgentMode(
  sessionId: string,
  enabled: boolean,
  translate: (key: string) => string = (key) => key
): string {
  if (!enabled) return translate('普通聊天')
  const config = getAgentSessionConfig(sessionId)
  if (!config.deviceControlEnabled) {
    return `Agent · ${translate('内部工具')} · ${translate(APPROVAL_LABEL[config.approvalMode])}`
  }
  const backend =
    config.backend === 'accessibility' ? translate('无障碍') : config.backend === 'shizuku' ? 'Shizuku' : 'Root'
  return `Agent · ${translate('手机控制')} ${backend} · ${translate(APPROVAL_LABEL[config.approvalMode])}`
}

export function AgentSessionControls({
  sessionId,
  enabled,
  onToggle,
  showStatus = true,
}: {
  sessionId: string
  enabled: boolean
  onToggle: (enabled: boolean) => Promise<void>
  showStatus?: boolean
}) {
  const { t } = useTranslation()
  const [config, setConfig] = useState(() => getAgentSessionConfig(sessionId))
  const [settingsOpened, setSettingsOpened] = useState(false)
  const [phonePermissionOpened, setPhonePermissionOpened] = useState(false)
  const [fullWarningOpened, setFullWarningOpened] = useState(false)
  const [pendingEnable, setPendingEnable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [approvalMode, setApprovalMode] = useState<AgentApprovalMode>(config.approvalMode)
  const [backend, setBackend] = useState<AgentBackend>(config.backend)
  const [deviceControlEnabled, setDeviceControlEnabled] = useState(config.deviceControlEnabled)
  const [permissionStatus, setPermissionStatus] = useState<DevicePermissionStatus | null>(null)
  const [backendReady, setBackendReady] = useState(false)
  const [backendDetail, setBackendDetail] = useState('')
  const [authorizing, setAuthorizing] = useState(false)
  const [returnToApp, setReturnToApp] = useState(() => getAgentRuntimeSettings().returnToAppOnComplete)
  const [presetModalOpened, setPresetModalOpened] = useState(false)

  useEffect(() => {
    const next = getAgentSessionConfig(sessionId)
    setConfig(next)
    setApprovalMode(next.approvalMode)
    setBackend(next.backend)
    setDeviceControlEnabled(next.deviceControlEnabled)
  }, [sessionId, enabled])

  const refreshBackend = async (selected = backend) => {
    if (selected === 'root') {
      const root = getCachedRootCapability()
      setBackendReady(Boolean(root?.available))
      setBackendDetail(root?.detail || '尚未检测 Root 授权')
      return
    }
    const permissions = await yachiyoDeviceAccessNative.getPermissionStatus()
    setPermissionStatus(permissions)
    if (selected === 'shizuku') {
      setBackendReady(permissions.shizukuGranted)
      setBackendDetail(
        permissions.shizukuGranted
          ? 'Shizuku 已授权'
          : permissions.shizukuRunning
            ? '等待 Shizuku 授权'
            : 'Shizuku 服务未运行'
      )
    } else {
      setBackendReady(permissions.accessibility)
      setBackendDetail(permissions.accessibility ? '无障碍服务已连接' : '无障碍服务尚未启用')
    }
  }

  useEffect(() => {
    if (settingsOpened || phonePermissionOpened) void refreshBackend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpened, phonePermissionOpened, backend])

  useEffect(() => {
    if (!settingsOpened && !phonePermissionOpened) return
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshBackend()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsOpened, phonePermissionOpened, backend])

  const status = useMemo(() => {
    const stateLabel = String(enabled ? t('Agent 已启用') : t('Agent 能力未启用'))
    if (!enabled) return stateLabel
    const mode = describeAgentMode(sessionId, enabled, (key) => String(t(key))).replace(/^Agent\s*·\s*/, '')
    return `${stateLabel} · ${mode}`
  }, [sessionId, enabled, config, t])

  const openSettings = (enableAfterSave = false) => {
    setPendingEnable(enableAfterSave)
    setSettingsOpened(true)
  }

  const toggle = async () => {
    if (enabled) {
      const next = saveAgentSessionConfig(sessionId, { enabled: false, allowDangerousForConversation: false })
      setConfig(next)
      await onToggle(false)
      return
    }
    // Skip configuration check and allow enabling Agent for any model
    const next = saveAgentSessionConfig(sessionId, { 
      enabled: true,
      configured: true, // Force as configured
      backend: getAgentBackend(),
      deviceControlEnabled: false, // Default to safe mode
      approvalMode: 'manual' // Default to safest mode
    })
    setConfig(next)
    await onToggle(true)
  }

  const selectApprovalMode = (value: string) => {
    const next = value as AgentApprovalMode
    if (next === 'full') {
      setFullWarningOpened(true)
      return
    }
    setApprovalMode(next)
  }

  const save = async () => {
    setSaving(true)
    try {
      const next = saveAgentSessionConfig(sessionId, {
        backend,
        deviceControlEnabled,
        approvalMode,
        configured: true,
        enabled: pendingEnable || enabled,
        allowDangerousForConversation: false,
      })
      setConfig(next)
      setSettingsOpened(false)
      if (pendingEnable) await onToggle(true)
      setPendingEnable(false)
    } finally {
      setSaving(false)
    }
  }

  const authorizeBackend = async () => {
    setAuthorizing(true)
    try {
      if (backend === 'root') {
        await getRootCapability()
      } else if (backend === 'shizuku') {
        const permissions = await yachiyoDeviceAccessNative.getPermissionStatus()
        if (permissions.shizukuRunning) await yachiyoDeviceAccessNative.requestShizukuPermission()
        else await yachiyoDeviceAccessNative.openPermissionSettings('shizuku')
      } else {
        await yachiyoDeviceAccessNative.openPermissionSettings('accessibility')
      }
      await refreshBackend()
    } finally {
      setAuthorizing(false)
    }
  }

  const changePhoneBackend = (value: string) => {
    const next = value as AgentBackend
    setBackend(next)
    setAgentBackend(next)
    setBackendReady(false)
    void refreshBackend(next)
  }

  const phonePermissionsReady = Boolean(permissionStatus?.overlay && backendReady)
  const toggleLabel = String(enabled ? t('停用 Agent') : t('启用 Agent'))
  const settingsLabel = String(t('Agent 设置'))
  const headerActions: AdaptiveActionDescriptor[] = [
    {
      id: 'toggle',
      label: toggleLabel,
      icon: IconBolt,
      priority: 100,
      collapseStrategy: 'icon',
      layoutKey: enabled ? 'enabled' : 'disabled',
      renderControl: ({ presentation }) =>
        presentation === 'labelled' ? (
          <Button
            className="yachiyo-agent-toggle"
            variant={enabled ? 'filled' : 'outline'}
            color={enabled ? undefined : 'gray'}
            aria-pressed={enabled}
            leftSection={<IconBolt size={17} />}
            onClick={() => void toggle()}
          >
            {toggleLabel}
          </Button>
        ) : (
          <Tooltip label={toggleLabel}>
            <ActionIcon
              className="yachiyo-agent-toggle"
              size={44}
              variant={enabled ? 'filled' : 'outline'}
              color={enabled ? undefined : 'gray'}
              aria-label={toggleLabel}
              aria-pressed={enabled}
              onClick={() => void toggle()}
            >
              <IconBolt size={19} />
            </ActionIcon>
          </Tooltip>
        ),
    },
    {
      id: 'settings',
      label: settingsLabel,
      icon: IconAdjustments,
      priority: 70,
      collapseStrategy: 'icon-then-overflow',
      menuAction: { onSelect: () => openSettings(false) },
      renderControl: () => (
        <Tooltip label={settingsLabel}>
          <ActionIcon
            className="yachiyo-agent-settings-button"
            size={44}
            variant="filled"
            color="blue"
            aria-label={settingsLabel}
            aria-expanded={settingsOpened}
            onClick={() => openSettings(false)}
          >
            <IconAdjustments size={19} />
          </ActionIcon>
        </Tooltip>
      ),
    },
    {
      id: 'presets',
      label: t('Agent 预设'),
      icon: IconShieldLock,
      priority: 60,
      collapseStrategy: 'icon-then-overflow',
      menuAction: { onSelect: () => setPresetModalOpened(true) },
      renderControl: ({ presentation }) =>
        presentation === 'labelled' ? (
          <Button
            variant="light"
            leftSection={<IconShieldLock size={17} />}
            onClick={() => setPresetModalOpened(true)}
          >
            {t('Agent 预设')}
          </Button>
        ) : (
          <Tooltip label={t('Agent 预设')}>
            <ActionIcon
              size={44}
              variant="light"
              color="blue"
              aria-label={t('Agent 预设')}
              onClick={() => setPresetModalOpened(true)}
            >
              <IconShieldLock size={19} />
            </ActionIcon>
          </Tooltip>
        ),
    },
  ]

  return (
    <>
      <div className="yachiyo-agent-header-controls" data-enabled={enabled ? 'true' : 'false'}>
        <AdaptiveActionCluster
          className="yachiyo-agent-header-actions"
          ariaLabel={String(t('Agent 控制'))}
          actions={headerActions}
        />
        {showStatus && (
          <Text size="xs" c="dimmed" className="yachiyo-agent-mode-label">
            {status}
          </Text>
        )}
      </div>

      <AdaptiveModal
        opened={settingsOpened}
        onClose={() => {
          setSettingsOpened(false)
          setPendingEnable(false)
        }}
        title={t('当前对话的 Agent 设置')}
        centered
        size="lg"
      >
        <Stack gap="md">
          <section className="yachiyo-agent-config-panel">
            <Title order={2}>{t('Agent 预设')}</Title>
            <Stack gap="sm">
              {copilots.map((copilot) => {
                const isActive = sessionsStore.getSession(sessionId)?.copilotId === copilot.id
                return (
                  <Button
                    key={copilot.id}
                    variant={isActive ? 'filled' : 'light'}
                    fullWidth
                    justify="space-between"
                    rightSection={isActive ? <IconCheck size={16} /> : null}
                    onClick={() => {
                      setActiveCopilot(sessionId, copilot)
                      setSettingsOpened(false)
                    }}
                  >
                    {copilot.name}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                fullWidth
                leftSection={<IconPlus size={16} />}
                onClick={() => {
                  // TODO: Implement new preset creation flow
                  alert(t('New preset creation will be implemented here'))
                }}
              >
                {t('+ 新建 Agent 预设')}
              </Button>
            </Stack>
          </section>
          <AgentConfigurationPanel showAccessBackend={false} sessionId={sessionId} />
          <section className="yachiyo-agent-config-panel">
            <Switch
              size="md"
              label={t('手机控制')}
              description={Capacitor.isNativePlatform() 
                ? t('可选。开启后才允许 Agent 通过 Root、Shizuku 或无障碍观察和操作手机。')
                : t('使用本地 ADB/Fastboot 桥接控制连接的设备')}
              checked={deviceControlEnabled}
              disabled={false}
              onChange={(event) => {
                const checked = event.currentTarget.checked
                setDeviceControlEnabled(checked)
                if (checked) {
                  if (Capacitor.isNativePlatform()) {
                    setPhonePermissionOpened(true)
                    void refreshBackend()
                  } else {
                    // Auto-enable desktop MCP server
                    createDesktopMcpServer(8080, generateRandomSecret(), {
                      allowLan: false,
                      staticDir: join(process.cwd(), 'dist/renderer')
                    }).start()
                  }
                }
              }}
            />
            {deviceControlEnabled && (
              <Button variant="light" onClick={() => setPhonePermissionOpened(true)}>
                {t('手机控制权限与后端')}
              </Button>
            )}
          </section>
          <section className="yachiyo-agent-config-panel">
            <div>
              <Title order={2}>{t('执行审批')}</Title>
              <Text c="dimmed" size="sm">
                {t('手动审批会确认每次写操作；AI 预审只将高风险操作交给你；完全控制不会询问。')}
              </Text>
            </div>
            <SegmentedControl
              fullWidth
              value={approvalMode}
              onChange={selectApprovalMode}
              data={APPROVAL_OPTIONS.map((option) => ({ ...option, label: String(t(option.label)) }))}
            />
            {deviceControlEnabled && (
              <Switch
                label={t('任务完成后自动返回 Yachiyo Claw')}
                description={t('Agent 在其他应用操作完成后，将 Yachiyo Claw 重新切换到前台。')}
                checked={returnToApp}
                onChange={(event) => {
                  const checked = event.currentTarget.checked
                  setReturnToApp(checked)
                  saveAgentRuntimeSettings({ returnToAppOnComplete: checked })
                }}
              />
            )}
          </section>
          {config.allowDangerousForConversation && (
            <Alert color="orange" icon={<IconAlertTriangle size={18} />} title={t('当前对话已跳过后续审批')}>
              <Button
                mt="xs"
                size="compact-sm"
                variant="light"
                onClick={() => setConfig(saveAgentSessionConfig(sessionId, { allowDangerousForConversation: false }))}
              >
                {t('恢复审批')}
              </Button>
            </Alert>
          )}
          <AdaptiveModal.Actions>
            <Button variant="default" onClick={() => setSettingsOpened(false)}>
              {t('取消')}
            </Button>
            <Button
              loading={saving}
              disabled={deviceControlEnabled && !phonePermissionsReady}
              onClick={() => void save()}
            >
              {t('保存设置')}
            </Button>
          </AdaptiveModal.Actions>
        </Stack>
      </AdaptiveModal>

      <AdaptiveModal
        opened={presetModalOpened}
        onClose={() => setPresetModalOpened(false)}
        title={t('选择 Agent 预设')}
        centered
        size="md"
      >
        <Stack gap="sm">
          {copilots.map((copilot) => {
            const isActive = sessionsStore.getSession(sessionId)?.copilotId === copilot.id
            return (
              <Button
                key={copilot.id}
                variant={isActive ? 'filled' : 'light'}
                fullWidth
                justify="space-between"
                rightSection={isActive ? <IconCheck size={16} /> : null}
                onClick={() => {
                  setActiveCopilot(sessionId, copilot)
                  setPresetModalOpened(false)
                }}
              >
                {copilot.name}
              </Button>
            )
          })}
          <Button
            variant="outline"
            fullWidth
            leftSection={<IconPlus size={16} />}
            onClick={() => {
              // TODO: Implement new preset creation flow
              alert(t('New preset creation will be implemented here'))
            }}
          >
            {t('+ 新建 Agent 预设')}
          </Button>
        </Stack>
      </AdaptiveModal>

      <AdaptiveModal
        opened={phonePermissionOpened}
        onClose={() => setPhonePermissionOpened(false)}
        title={t('手机控制权限')}
        centered
        size="lg"
      >
        <Stack gap="md">
          <Alert color="chatbox-brand" title={t('此权限仅用于操作手机')}>
            {t('内部 Linux 沙箱、Skills、MCP 和文件工具不需要 Root、Shizuku 或无障碍权限。')}
          </Alert>
          <section className="yachiyo-agent-config-panel">
            <Title order={2}>{t('控制方式')}</Title>
            <SegmentedControl
              fullWidth
              value={backend}
              onChange={changePhoneBackend}
              data={[
                { value: 'root', label: 'Root' },
                { value: 'shizuku', label: 'Shizuku' },
                { value: 'accessibility', label: String(t('无障碍')) },
              ]}
            />
            <Text size="sm" c={backendReady ? 'green' : 'orange'}>
              {t(backendDetail || '正在检测所选控制方式')}
            </Text>
            {!backendReady && (
              <Button variant="light" loading={authorizing} onClick={() => void authorizeBackend()}>
                {backend === 'root'
                  ? t('检测并授权 Root')
                  : backend === 'shizuku'
                    ? t('打开或授权 Shizuku')
                    : t('去开启无障碍服务')}
              </Button>
            )}
          </section>
          <section className="yachiyo-agent-config-panel">
            <Title order={2}>{t('操作状态悬浮窗')}</Title>
            <Text size="sm" c={permissionStatus?.overlay ? 'green' : 'orange'}>
              {permissionStatus?.overlay ? t('已授权') : t('未授权：用于显示操作光晕、流式状态、停止与审批入口。')}
            </Text>
            {!permissionStatus?.overlay && (
              <Button variant="light" onClick={() => void yachiyoDeviceAccessNative.openPermissionSettings('overlay')}>
                {t('去授权悬浮窗')}
              </Button>
            )}
          </section>
          <AdaptiveModal.Actions>
            <Button variant="default" onClick={() => setPhonePermissionOpened(false)}>
              {t('稍后处理')}
            </Button>
            <Button disabled={!phonePermissionsReady} onClick={() => setPhonePermissionOpened(false)}>
              {t('权限已就绪')}
            </Button>
          </AdaptiveModal.Actions>
        </Stack>
      </AdaptiveModal>

      <AdaptiveModal
        opened={fullWarningOpened}
        onClose={() => setFullWarningOpened(false)}
        title={t('启用完全控制？')}
        centered
        size="sm"
      >
        <Stack gap="md">
          <Alert color="red" icon={<IconShieldLock size={20} />} title={t('该模式风险很高')}>
            {t('Agent 可以直接执行 Root/Shizuku 命令、操作其他应用并修改或删除数据，不再逐次询问。')}
          </Alert>
          <AdaptiveModal.Actions>
            <Button variant="default" onClick={() => setFullWarningOpened(false)}>
              {t('保持审批')}
            </Button>
            <Button
              color="red"
              onClick={() => {
                setApprovalMode('full')
                setFullWarningOpened(false)
              }}
            >
              {t('我了解风险，继续')}
            </Button>
          </AdaptiveModal.Actions>
        </Stack>
      </AdaptiveModal>
    </>
  )
}
