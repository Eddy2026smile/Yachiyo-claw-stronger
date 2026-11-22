import { useState } from 'react';
import { Stack, TextInput, Button } from '@mantine/core';

export function ConnectDesktopScreen() {
  const [ip, setIp] = useState('');
  const [secret, setSecret] = useState('');

  const connect = () => {
    // TODO: Implement connection logic
  };

  return (
    <Stack>
      <TextInput
        label="Desktop IP"
        value={ip}
        onChange={(e) => setIp(e.currentTarget.value)}
      />
      <TextInput
        label="Connection Secret" 
        value={secret}
        onChange={(e) => setSecret(e.currentTarget.value)}
      />
      <Button onClick={connect}>Pair Device</Button>
    </Stack>
  );
}
