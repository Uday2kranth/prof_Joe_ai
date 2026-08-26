// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DsaLabView } from '../../components/dsa/DsaLabView';

describe('Layer 3: DsaLabView Component Tests', () => {
  beforeAll(() => {
    // Mock requestAnimationFrame & cancelAnimationFrame
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame = (cb) => setTimeout(cb, 16) as any;
      window.cancelAnimationFrame = (id) => clearTimeout(id as any);
    }
  });

  it('should render DsaLabView with default Sorting category without crashing', () => {
    render(<DsaLabView />);
    expect(screen.getAllByText(/Bubble Sort/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Best Time:/i)).toBeTruthy();
    expect(screen.getByText(/Average Time:/i)).toBeTruthy();
  });

  it('should allow switching between categories via the category selector dropdown', () => {
    render(<DsaLabView />);

    const selects = screen.getAllByRole('combobox');
    const categorySelect = selects[0];
    expect(categorySelect).toBeTruthy();

    // Switch to Graph category
    fireEvent.change(categorySelect, { target: { value: 'graph' } });
    expect(screen.getAllByText(/GRAPH/i).length).toBeGreaterThan(0);

    // Switch to Dynamic Programming category
    fireEvent.change(categorySelect, { target: { value: 'dp' } });
    expect(screen.getAllByText(/DYNAMIC PROGRAMMING/i).length).toBeGreaterThan(0);

    // Switch to Backtracking category
    fireEvent.change(categorySelect, { target: { value: 'backtracking' } });
    expect(screen.getAllByText(/BACKTRACKING/i).length).toBeGreaterThan(0);
  });

  it('should allow switching multi-language code tabs (Python, C++, Java, Pseudo)', () => {
    render(<DsaLabView />);

    // Click C++ code tab
    const cppBtn = screen.getByRole('button', { name: /C\+\+/i });
    expect(cppBtn).toBeTruthy();
    fireEvent.click(cppBtn);

    // Click Java code tab
    const javaBtn = screen.getByRole('button', { name: /Java/i });
    expect(javaBtn).toBeTruthy();
    fireEvent.click(javaBtn);

    // Click Pseudo code tab
    const pseudoBtn = screen.getByRole('button', { name: /Pseudo/i });
    expect(pseudoBtn).toBeTruthy();
    fireEvent.click(pseudoBtn);
  });
});
