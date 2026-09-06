// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeepLearningStudioView, DL_STUDIO_MODULES } from '../../components/DeepLearningStudioView';

describe('Layer 3: DeepLearningStudioView Component Tests', () => {
  beforeAll(() => {
    // Mock requestAnimationFrame & cancelAnimationFrame
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as any;
      window.cancelAnimationFrame = (id) => clearTimeout(id as any);
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

  it('should render the Deep Learning Bento Gallery Hub without crashing', () => {
    render(<DeepLearningStudioView />);
    expect(screen.getByText(/Deep Learning & Neural Network Studio/i)).toBeTruthy();
    expect(screen.getByText(/BENTO SUITE/i)).toBeTruthy();
  });

  it('should render all 8 Deep Learning modules in the Bento Hub gallery', () => {
    render(<DeepLearningStudioView />);
    for (const mod of DL_STUDIO_MODULES) {
      const matches = screen.queryAllByText(mod.name);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('should filter module cards when typing in the search box', () => {
    render(<DeepLearningStudioView />);
    const searchInput = screen.getByPlaceholderText(/Search 8 DL models\.\.\./i);
    expect(searchInput).toBeTruthy();

    fireEvent.change(searchInput, { target: { value: 'Transformer' } });
    expect(screen.queryAllByText(/Multi-Head Attention & QKV Lab/i).length).toBeGreaterThanOrEqual(1);
  });

  it('should launch Studio Sheet view from Bento card and return to Bento Hub', () => {
    render(<DeepLearningStudioView />);

    // Click on MLP Playground Launch button
    const launchBtns = screen.getAllByRole('button', { name: /Launch Sheet/i });
    expect(launchBtns.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(launchBtns[0]);

    // Verify Studio Sheet view is active with Back to Bento button
    const backBtn = screen.getByRole('button', { name: /← Bento Hub/i });
    expect(backBtn).toBeTruthy();

    // Verify MLP Playground controls are accessible
    const geluBtn = screen.getByRole('button', { name: /GELU/i });
    expect(geluBtn).toBeTruthy();
    fireEvent.click(geluBtn);
    expect(screen.getByText(/0\.044715/i)).toBeTruthy();

    // Return to Bento Hub
    fireEvent.click(backBtn);
    expect(screen.getByPlaceholderText(/Search 8 DL models\.\.\./i)).toBeTruthy();
  });
});

