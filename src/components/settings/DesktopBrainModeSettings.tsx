import React, { useState } from 'react'

export function DesktopBrainModeSettings() {
  const [enabled, setEnabled] = useState(false)
  const [tailscaleIp, setTailscaleIp] = useState('100.x.y.z')
  const [secret, setSecret] = useState(() => crypto.randomUUID())
  const [copied, setCopied] = useState(false)

  const connectionString = `http://${tailscaleIp}:8080/mcp | Bearer ${secret}`

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
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          aria-label="Enable Desktop Brain Mode"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Tailscale IP</label>
        <input
          type="text"
          value={tailscaleIp}
          onChange={(e) => setTailscaleIp(e.target.value)}
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
            onClick={() => setSecret(crypto.randomUUID())}
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
