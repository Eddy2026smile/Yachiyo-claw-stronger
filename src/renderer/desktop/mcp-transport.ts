export type MCPTransport = 'stdio' | 'uvx' | 'docker' | 'tailscale';
export interface MCPServerConfig {
  id: string;
  name: string;
  transport: MCPTransport;
  command: string[];
  workingDirectory?: string;
  env?: Record<string, string>;
}

export const exampleMCPServers: MCPServerConfig[] = [
  {
    id: 'arcade-toolbox',
    name: 'Arcade Toolbox',
    transport: 'stdio',
    command: ['npx', 'arcade-toolbox'],
  },
  {
    id: 'sympy',
    name: 'SymPy Math',
    transport: 'uvx', 
    command: ['python', '-m', 'sympy'],
  },
];
