import React, { useEffect, useState } from 'react'
import { pullBrainSync, pushBrainSync } from '../../renderer/setup/brain_sync'

const STORAGE_KEY = 'yachiyo:desktop-brain-mode'

interface DesktopBrainConfig {
  enabled: boolean
  tailscaleIp: string
  secret: string
}

function loadConfig(): DesktopBrainConfig {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<DesktopBrainConfig>
      return {
        enabled: Boolean(parsed.enabled),
        tailscaleIp: parsed.tailscaleIp || '100.x.y.z',
        secret: parsed.secret || crypto.randomUUID(),
      }
    }
  } catch {}
  return { enabled: false, tailscaleIp: '100.x.y.z', secret: crypto.randomUUID() }
}

export function DesktopBrainModeSettings() {
  const [config, setConfig] = useState<DesktopBrainConfig>(loadConfig)
  const [copied, setCopied] = useState(false)
  const [syncStatus, setSyncStatus] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {}
  }, [config])

  const connectionString = `http://${config.tailscaleIp}:8080/mcp | Bearer ${config.secret}`

  const handleCopy = () => {
    void navigator.clipboard?.writeText(connectionString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePush = async () => {
    setSyncStatus('Pushing state...')
    const res = await pushBrainSync()
    setSyncStatus(res.ok ? `Synced to server (rev ${res.revision})` : 'Push failed — verify Tailscale IP & secret')
  }

  const handlePull = async () => {
    setSyncStatus('Pulling state...')
    const res = await pullBrainSync()
    if (res.ok && res.updated) {
      setSyncStatus('Updated — reloading...')
      setTimeout(() => window.location.reload(), 600)
    } else if (res.ok) {
      setSyncStatus('Already up to date')
    } else {
      setSyncStatus('Pull failed — verify Tailscale IP & secret')
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Desktop Brain Mode &amp; Full Sync</h2>
          <p className="text-sm opacity-75">Sync chats, API keys, characters &amp; MCPs over Tailscale (port 8080).</p>
        </div>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
          aria-label="Enable Desktop Brain Mode"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Mac Tailscale IP</label>
        <input
          type="text"
          value={config.tailscaleIp}
          onChange={(e) => setConfig((prev) => ({ ...prev, tailscaleIp: e.target.value }))}
          placeholder="100.x.y.z"
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tailscale Connection String &amp; Secret</label>
        <div className="flex gap-2">
          <input type="text" readOnly value={connectionString} className="w-full rounded border px-3 py-2 font-mono text-xs" />
          <button type="button" onClick={handleCopy} className="rounded border px-3 py-2 text-sm font-medium">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={() => setConfig((prev) => ({ ...prev, secret: crypto.randomUUID() }))}
            className="rounded border px-3 py-2 text-sm"
          >
            Rotate
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <button type="button" onClick={() => void handlePush()} className="rounded border px-3 py-1.5 text-sm font-medium">
          Push This Device → Server
        </button>
        <button type="button" onClick={() => void handlePull()} className="rounded border px-3 py-1.5 text-sm font-medium">
          Pull Server → This Device
        </button>
        {syncStatus && <span className="text-xs opacity-80">{syncStatus}</span>}
      </div>

      <p className="text-xs opacity-75">
        CORS-Free Safari Proxy: For external HTTP MCPs in Safari, use http://localhost:8080/proxy?url=&lt;encoded-url&gt;
      </p>
    </div>
  )
}
