import { describe, it, expect } from 'vitest';
import { shouldRouteToDesktop } from './smart-router';
import { ToolDefinition } from './types';

describe('smart routing', () => {
  it('routes heavy tools to desktop when connected', () => {
    const tool = { id: 'wolfram' } as ToolDefinition;
    expect(shouldRouteToDesktop(tool, true)).toBe(true);
  });

  it('keeps light tools local', () => {
    const tool = { id: 'simple-tool' } as ToolDefinition;
    expect(shouldRouteToDesktop(tool, true)).toBe(false); 
  });
});
