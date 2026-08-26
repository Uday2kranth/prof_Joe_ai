// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestDiagramsStudioView } from '../../components/TestDiagramsStudioView';

describe('Diagnostic 3: Console Error & Silent Warning Sniffer', () => {
  const consoleErrors: string[] = [];
  const consoleWarns: string[] = [];

  let originalError: typeof console.error;
  let originalWarn: typeof console.warn;

  beforeAll(() => {
    // Mock Canvas getContext for JSDOM
    if (typeof window !== 'undefined') {
      window.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
        fillRect: vi.fn(),
        clearRect: vi.fn(),
        getImageData: vi.fn(() => ({ data: new Array(4) })),
        putImageData: vi.fn(),
        createImageData: vi.fn(() => []),
        setTransform: vi.fn(),
        drawImage: vi.fn(),
        save: vi.fn(),
        fillText: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        arc: vi.fn(),
        setLineDash: vi.fn(),
        strokeRect: vi.fn(),
        measureText: vi.fn().mockReturnValue({ width: 50 }),
      }) as any;
    }

    originalError = console.error;
    originalWarn = console.warn;

    console.error = (...args: any[]) => {
      consoleErrors.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      originalError(...args);
    };

    console.warn = (...args: any[]) => {
      consoleWarns.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
      originalWarn(...args);
    };
  });

  afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
  });

  it('should render and transition Studio Views with ZERO critical React errors or unhandled exceptions', () => {
    render(<TestDiagramsStudioView />);

    // Launch Sheet
    const launchBtn = screen.getByRole('button', { name: /Launch Active Sheet/i });
    expect(launchBtn).toBeTruthy();
    fireEvent.click(launchBtn);

    // Return to Bento Hub
    const backBtn = screen.getByRole('button', { name: /← Bento Hub/i });
    expect(backBtn).toBeTruthy();
    fireEvent.click(backBtn);

    // Filter by search
    const searchInput = screen.getByPlaceholderText(/Search 11\+ models\.\.\./i);
    fireEvent.change(searchInput, { target: { value: 'Regression' } });

    // Assert that no unhandled React errors were logged
    const fatalErrors = consoleErrors.filter(err => 
      err.includes('Uncaught') || 
      err.includes('Cannot read properties of undefined') ||
      err.includes('NaN is not a valid value')
    );

    expect(fatalErrors).toHaveLength(0);
  });
});
