import { useState } from 'react'
import { Stack, TextInput, SimpleGrid, Card, Text, CopyButton, Code } from '@mantine/core'
import { MCPServerConfig, exampleMCPServers } from '@/desktop/mcp-transport'

export function DesktopBrainModeSettings() {
  const [tailscaleKey, setTailscaleKey] = useState('')
  const [servers, setServers] = useState<MCPServerConfig[]>(exampleMCPServers)

  return (
    <Stack>
      <TextInput
        label="Tailscale Connection String"
        value={tailscaleKey}
        readOnly
        rightSection={
          <CopyButton value={tailscaleKey}>
            {({ copy }) => <button onClick={copy}>Copy</button>}
          </CopyButton>
        }
      />
      <Text>Keep awake guidance: Use your OS power settings</Text>

      <SimpleGrid cols={2}>
        {servers.map((server) => (
          <Card key={server.id}>
            <Text>{server.name}</Text>
            <Code>{server.command.join(' ')}</Code>
          </Card>
        ))}
      </SimpleGrid>
    </Stack>
  )
}
