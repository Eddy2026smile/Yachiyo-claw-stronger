export interface McpRegistryEntry {
  id: string
  name: string
  description: string
  endpoint: string
  capabilities: string[]
}

export interface RemoteConnectionResult {
  success: boolean
  workflowId: string | null
  error?: string
}
