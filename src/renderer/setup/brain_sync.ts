const STORAGE_KEY = 'yachiyo:desktop-brain-mode'
const REVISION_KEY = 'yachiyo:brain-sync-revision'
const DEVICE_ID_KEY = 'yachiyo:brain-device-id'

export interface DesktopBrainConfig {
  enabled: boolean
  tailscaleIp: string
  secret: string
}

export function getBrainConfig(): DesktopBrainConfig | null {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    return raw ? (JSON.parse(raw) as DesktopBrainConfig) : null
  } catch {
    return null
  }
}

function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

function getSyncBaseUrl(cfg: DesktopBrainConfig): string {
  const isLocalMac =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '8080'
  return isLocalMac ? 'http://localhost:8080' : `http://${cfg.tailscaleIp.trim()}:8080`
}

export async function pullBrainSync(): Promise<{ ok: boolean; updated: boolean; revision?: number }> {
  const cfg = getBrainConfig()
  if (!cfg?.enabled || !cfg.secret || !cfg.tailscaleIp || cfg.tailscaleIp === '100.x.y.z') {
    return { ok: false, updated: false }
  }
  try {
    const res = await fetch(`${getSyncBaseUrl(cfg)}/sync`, {
      headers: { Authorization: `Bearer ${cfg.secret}` },
    })
    if (!res.ok) return { ok: false, updated: false }
    const env = (await res.json()) as { revision: number; data: Record<string, unknown> }
    const localRev = Number(localStorage.getItem(REVISION_KEY) || '0')
    if (env.revision > localRev && env.data) {
      let updated = false
      for (const [k, v] of Object.entries(env.data)) {
        if (k === STORAGE_KEY || k === REVISION_KEY || k === DEVICE_ID_KEY) continue
        if (typeof v === 'string' && localStorage.getItem(k) !== v) {
          localStorage.setItem(k, v)
          updated = true
        }
      }
      localStorage.setItem(REVISION_KEY, String(env.revision))
      return { ok: true, updated, revision: env.revision }
    }
    return { ok: true, updated: false, revision: localRev }
  } catch {
    return { ok: false, updated: false }
  }
}

export async function pushBrainSync(): Promise<{ ok: boolean; revision?: number }> {
  const cfg = getBrainConfig()
  if (!cfg?.enabled || !cfg.secret || !cfg.tailscaleIp || cfg.tailscaleIp === '100.x.y.z') {
    return { ok: false }
  }
  try {
    const data: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k || k === STORAGE_KEY || k === REVISION_KEY || k === DEVICE_ID_KEY) continue
      const v = localStorage.getItem(k)
      if (v !== null) data[k] = v
    }
    const revision = Date.now()
    const res = await fetch(`${getSyncBaseUrl(cfg)}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.secret}` },
      body: JSON.stringify({ revision, deviceId: getDeviceId(), data }),
    })
    if (!res.ok) return { ok: false }
    const saved = (await res.json()) as { revision: number }
    localStorage.setItem(REVISION_KEY, String(saved.revision || revision))
    return { ok: true, revision: saved.revision || revision }
  } catch {
    return { ok: false }
  }
}
