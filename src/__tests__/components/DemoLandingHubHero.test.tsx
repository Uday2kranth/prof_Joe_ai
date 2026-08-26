// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DemoLandingHub } from '../../components/DemoLandingHub';
import { Hero3DPreviewShowcase } from '../../components/Hero3DPreviewShowcase';

describe('Layer 3: Home Landing Hub & 2-Tier Hero Showcase Tests', () => {
  beforeAll(() => {
    // Mock requestAnimationFrame & cancelAnimationFrame
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as any;
      window.cancelAnimationFrame = (id) => clearTimeout(id as any);
      // Mock getContext on HTMLCanvasElement
      HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        createRadialGradient: vi.fn().mockReturnValue({
          addColorStop: vi.fn()
        }),
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        arc: vi.fn()
      }) as any;
    }
  });

  it('should render Hero3DPreviewShowcase with 3 switchable preview modes', () => {
    const launchMock = vi.fn();
    render(<Hero3DPreviewShowcase onLaunchStudio={launchMock} />);

    expect(screen.getByText(/Live 3D Hero Preview:/i)).toBeTruthy();
    expect(screen.getByText(/3D SVC Lift/i)).toBeTruthy();
    expect(screen.getByText(/3D Gaussian Bell/i)).toBeTruthy();
    expect(screen.getByText(/Neural Waves/i)).toBeTruthy();

    // Switch to Gaussian Bell mode
    fireEvent.click(screen.getByText(/3D Gaussian Bell/i));
    
    // Switch to Neural Waves mode
    fireEvent.click(screen.getByText(/Neural Waves/i));

    // Click Launch Full Studio button
    const launchBtn = screen.getByRole('button', { name: /Launch Full Studio/i });
    expect(launchBtn).toBeTruthy();
    fireEvent.click(launchBtn);
    expect(launchMock).toHaveBeenCalledWith('deep_learning_studio');
  });

  it('should render DemoLandingHub with 2-Tier Hero and all Subject Gateway Cards', () => {
    const selectWorkspaceMock = vi.fn();
    const openSettingsMock = vi.fn();
    const toggleThemeMock = vi.fn();

    render(
      <DemoLandingHub
        onSelectWorkspace={selectWorkspaceMock}
        onOpenSettings={openSettingsMock}
        theme="dark"
        onToggleTheme={toggleThemeMock}
      />
    );

    expect(screen.getAllByText(/Prof. Joe AI/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Live 3D Hero Preview:/i)).toBeTruthy();
    expect(screen.getAllByText(/Data Structures & Algorithms/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Deep Learning Studio/i).length).toBeGreaterThan(0);

    // Click DSA Lab Card
    const dsaCard = screen.getAllByText(/Data Structures & Algorithms/i)[0].closest('.hub-portal-card');
    expect(dsaCard).toBeTruthy();
    if (dsaCard) fireEvent.click(dsaCard);
    expect(selectWorkspaceMock).toHaveBeenCalledWith('dsa_lab');
  });
});
