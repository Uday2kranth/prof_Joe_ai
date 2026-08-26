import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Diagnostic 2: Memory Leak & Event Listener Cleanup Static Scanner', () => {
  const rootDir = process.cwd();
  const studioFilePath = path.join(rootDir, 'src/components/TestDiagramsStudioView.tsx');

  it('should verify that TestDiagramsStudioView.tsx exists and is readable', () => {
    expect(fs.existsSync(studioFilePath)).toBe(true);
  });

  it('should verify that every window.addEventListener in TestDiagramsStudioView has a matching removeEventListener', () => {
    const code = fs.readFileSync(studioFilePath, 'utf-8');

    // Find all window.addEventListener("event_name")
    const addListenerMatches = Array.from(code.matchAll(/window\.addEventListener\(\s*['"]([^'"]+)['"]/g)).map(m => m[1]);
    const removeListenerMatches = Array.from(code.matchAll(/window\.removeEventListener\(\s*['"]([^'"]+)['"]/g)).map(m => m[1]);

    for (const eventName of addListenerMatches) {
      expect(removeListenerMatches).toContain(eventName);
    }
  });

  it('should verify that document.addEventListener calls have corresponding removals', () => {
    const code = fs.readFileSync(studioFilePath, 'utf-8');

    const addMatches = Array.from(code.matchAll(/document\.addEventListener\(\s*['"]([^'"]+)['"]/g)).map(m => m[1]);
    const removeMatches = Array.from(code.matchAll(/document\.removeEventListener\(\s*['"]([^'"]+)['"]/g)).map(m => m[1]);

    for (const eventName of addMatches) {
      expect(removeMatches).toContain(eventName);
    }
  });

  it('should verify that setInterval hooks return a cleanup function with clearInterval', () => {
    const code = fs.readFileSync(studioFilePath, 'utf-8');

    const intervalCount = (code.match(/setInterval\(/g) || []).length;
    const clearIntervalCount = (code.match(/clearInterval\(/g) || []).length;

    // Every active interval timer must have cleanup logic
    expect(clearIntervalCount).toBeGreaterThanOrEqual(intervalCount);
  });
});
