// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeepLearningStudioView } from '../../components/DeepLearningStudioView';

describe('Layer 3: DeepLearningStudioView Component Tests', () => {
  beforeAll(() => {
    // Mock requestAnimationFrame & cancelAnimationFrame
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as any;
      window.cancelAnimationFrame = (id) => clearTimeout(id as any);
    }
  });

  it('should render the Deep Learning Studio view without crashing', () => {
    render(<DeepLearningStudioView />);
    expect(screen.getByText(/Deep Learning & Neural Network Studio/i)).toBeTruthy();
    expect(screen.getByText(/FORWARD & BACKPROP FLOW/i)).toBeTruthy();
  });

  it('should allow switching between deep learning modules via selector dropdown', () => {
    render(<DeepLearningStudioView />);
    
    const select = screen.getByRole('combobox');
    expect(select).toBeTruthy();

    // Switch to CNN module
    fireEvent.change(select, { target: { value: 'cnn_feature_maps' } });
    expect(screen.getByText(/Input Image Preset:/i)).toBeTruthy();

    // Switch to Transformers module
    fireEvent.change(select, { target: { value: 'transformer_attention' } });
    expect(screen.getByText(/Self-Attention Masking Mode:/i)).toBeTruthy();
  });

  it('should allow changing activation functions in MLP Playground', () => {
    render(<DeepLearningStudioView />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'mlp_playground' } });

    // Click GELU activation button in the PillSelector
    const geluBtn = screen.getByRole('button', { name: /GELU/i });
    expect(geluBtn).toBeTruthy();
    fireEvent.click(geluBtn);

    // Verify GELU formula description with cubic term
    expect(screen.getByText(/0\.044715/i)).toBeTruthy();
  });
});
