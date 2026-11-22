import { ToolDefinition } from './types';

export function shouldRouteToDesktop(
  tool: ToolDefinition,
  isDesktopConnected: boolean
): boolean {
  if (!isDesktopConnected) return false;
  
  const HEAVY_TOOLS = ['wolfram', 'symbolica', 'sympy'];
  return HEAVY_TOOLS.includes(tool.id);
}
