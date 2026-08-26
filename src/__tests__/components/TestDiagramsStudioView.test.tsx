// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestDiagramsStudioView, STUDIO_MODULES } from '../../components/TestDiagramsStudioView';

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

describe('Layer 3: TestDiagramsStudioView Component Smoke & UI Tests', () => {
  it('should render the Bento Gallery root view without crashing', () => {
    const { container } = render(<TestDiagramsStudioView />);
    expect(container).toBeTruthy();
    expect(screen.getByText(/Mafs • JSXGraph • Plotly • MathBox Studio/i)).toBeTruthy();
  });

  it('should render all modules in the Bento Hub gallery', () => {
    render(<TestDiagramsStudioView />);
    for (const mod of STUDIO_MODULES) {
      const match = screen.queryAllByText(mod.name);
      expect(match.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should filter module cards when typing in the search box', () => {
    render(<TestDiagramsStudioView />);
    const searchInput = screen.getByPlaceholderText(/Search 11\+ models\.\.\./i);
    expect(searchInput).toBeTruthy();

    fireEvent.change(searchInput, { target: { value: 'Fourier' } });
    expect(screen.queryAllByText(/Harmonics, Fourier & Vector Spaces/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should launch Studio Sheet view and switch active modules', () => {
    render(<TestDiagramsStudioView />);
    const launchBtn = screen.getByRole('button', { name: /Launch Active Sheet/i });
    expect(launchBtn).toBeTruthy();

    fireEvent.click(launchBtn);
    // In Studio Sheet view, the module title is displayed
    const titles = screen.queryAllByText(/Gaussian & Student-t Distributions/i);
    expect(titles.length).toBeGreaterThanOrEqual(1);

    // Switch back to Bento Hub
    const backBtn = screen.getByRole('button', { name: /← Bento Hub/i });
    expect(backBtn).toBeTruthy();
    fireEvent.click(backBtn);
    expect(screen.getByPlaceholderText(/Search 11\+ models\.\.\./i)).toBeTruthy();
  });
});
