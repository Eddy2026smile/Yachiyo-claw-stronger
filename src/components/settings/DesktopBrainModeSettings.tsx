import React, { useEffect, useState } from 'react'

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
  } catch {
    // ignore storage errors
  }
  return {
    enabled: false,
    tailscaleIp: '100.x.y.z',
    secret: crypto.randomUUID(),
  }
}

export function DesktopBrainModeSettings() {
  const [config, setConfig] = useState<DesktopBrainConfig>(loadConfig)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // ignore storage errors
    }
  }, [config])

  const connectionString = `http://${config.tailscaleIp}:8080/mcp | Bearer ${config.secret}`

  const handleCopy = () => {
    void navigator.clipboard?.writeText(connectionString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Desktop Brain Mode</h2>
          <p className="text-sm opacity-75">
            Expose local stdio MCP servers over Tailscale Streamable HTTP (port 8080).
          </p>
        </div>
        <input
          type="checkbox"
          checked={config.enabled}
          onChange={(e) => setConfig((prev) => ({ ...prev, enabled: e.target.checked }))}
          aria-label="Enable Desktop Brain Mode"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tailscale IP</label>
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
          <input
            type="text"
            readOnly
            value={connectionString}
            className="w-full rounded border px-3 py-2 font-mono text-xs"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="rounded border px-3 py-2 text-sm font-medium"
          >
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

      <p className="text-xs opacity-75">
        Keep-awake tip: Keep your desktop plugged in and prevent sleep while Android is paired.
      </p>
    </div>
  )
}
