// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock ExcalidrawModule to bypass roughjs ESM/CJS resolution in JSDOM
vi.mock('../../components/sandbox/ExcalidrawModule', () => ({
  ExcalidrawModule: () => <div data-testid="mock-excalidraw">Mock Excalidraw Engine</div>
}));

import { InteractiveSandboxView } from '../../components/InteractiveSandboxView';

// Mock Canvas context for JSDOM
beforeAll(() => {
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
});

describe('InteractiveSandboxView Component Tests', () => {
  it('should render the Interactive Teaching Sandbox without crashing', () => {
    render(<InteractiveSandboxView />);
    expect(screen.getAllByText(/Teaching Sandbox|Interactive Teaching Board/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/TEACHING SUITE ACTIVE/i)).toBeDefined();
  });

  it('should switch between Teaching Board, Academic Board, and Excalidraw', () => {
    render(<InteractiveSandboxView />);
    
    // Switch to Academic Board
    const academicBtn = screen.getByTitle(/Dedicated Prof. Joe Academic Chalkboard/i);
    fireEvent.click(academicBtn);
    expect(academicBtn).toBeDefined();

    // Switch to Excalidraw
    const excalidrawBtn = screen.getByTitle(/Excalidraw Hand-Drawn Vector Diagramming Suite/i);
    fireEvent.click(excalidrawBtn);
    expect(screen.getByTestId('mock-excalidraw')).toBeDefined();
  });

  it('should render studio gateway views and trigger navigation callbacks', () => {
    const handleNavigate = vi.fn();
    render(<InteractiveSandboxView onNavigateWorkspace={handleNavigate} />);

    // Click Deep Learning Studio gateway pill
    const dlPill = screen.getByTitle(/Deep Learning & Neural Matrix Studio Gateway/i);
    fireEvent.click(dlPill);

    const dlLaunchBtn = screen.getByRole('button', { name: /Launch Deep Learning Studio/i });
    expect(dlLaunchBtn).toBeDefined();
    fireEvent.click(dlLaunchBtn);
    expect(handleNavigate).toHaveBeenCalledWith('deep_learning_studio');

    // Click Math Studio gateway pill
    const mathPill = screen.getByTitle(/Advanced Math, Stats & ML Studio Gateway/i);
    fireEvent.click(mathPill);

    const mathLaunchBtn = screen.getByRole('button', { name: /Launch Math & Stats Studio/i });
    expect(mathLaunchBtn).toBeDefined();
    fireEvent.click(mathLaunchBtn);
    expect(handleNavigate).toHaveBeenCalledWith('test_diagrams');
  });
});
