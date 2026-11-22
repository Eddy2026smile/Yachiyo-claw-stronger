import { useState } from 'react'
import { Stack, TextInput, Text, CopyButton, Switch, Alert } from '@mantine/core'
import { IconInfoCircle } from '@tabler/icons-react'

export function DesktopBrainModeSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const tailscaleIp = '100.101.102.103' // Example Tailscale IP
  const bearerToken = 'your-secret-token' // Example bearer token
  const connectionString = `http://${tailscaleIp}:8080/mcp`
  const authHeader = `Bearer ${bearerToken}`

  return (
    <Stack>
      <Switch
        label="Enable Desktop Brain Mode"
        checked={isEnabled}
        onChange={(event) => setIsEnabled(event.currentTarget.checked)}
      />

      {isEnabled && (
        <>
          <TextInput
            label="Tailscale Connection String"
            value={connectionString}
            readOnly
            rightSection={
              <CopyButton value={connectionString}>
                {({ copy }) => <button onClick={copy}>Copy</button>}
              </CopyButton>
            }
          />

          <TextInput
            label="Authorization Header"
            value={authHeader}
            readOnly
            rightSection={
              <CopyButton value={authHeader}>
                {({ copy }) => <button onClick={copy}>Copy</button>}
              </CopyButton>
            }
          />

          <Alert icon={<IconInfoCircle />} color="blue">
            Keep awake guidance: Use your OS power settings to prevent sleep while in Desktop Brain Mode
          </Alert>
        </>
      )}
    </Stack>
  )
}
