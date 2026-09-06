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

  it('should render DsaLabView Category Bento Hub (Level 1) without crashing', () => {
    render(<DsaLabView />);
    expect(screen.getByText(/Data Structures & Algorithms Studio/i)).toBeTruthy();
    expect(screen.getByText(/8 CATEGORIES • 50\+ VISUALIZERS/i)).toBeTruthy();
    expect(screen.getByText(/1\. Sorting Algorithms/i)).toBeTruthy();
    expect(screen.getByText(/3\. Data Structures/i)).toBeTruthy();
    expect(screen.getByText(/4\. Graph Algorithms/i)).toBeTruthy();
  });

  it('should navigate from Category Deck (Level 1) to Algorithm Deck (Level 2) and filter with search', () => {
    render(<DsaLabView />);

    // Click on "1. Sorting Algorithms" Category Bento card
    const sortingCard = screen.getByText(/1\. Sorting Algorithms/i);
    fireEvent.click(sortingCard);

    // Now in Level 2 (Algorithm Bento Deck for Sorting)
    expect(screen.getByText(/All Categories/i)).toBeTruthy();
    expect(screen.getAllByText(/Bubble Sort/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Quick Sort/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Merge Sort/i).length).toBeGreaterThan(0);

    // Switch category via quick pill
    const graphPill = screen.getByRole('button', { name: /Graph Algorithms/i });
    fireEvent.click(graphPill);
    expect(screen.getAllByText(/Breadth-First Search/i).length).toBeGreaterThan(0);

    // Click Back to All Categories button
    const backBtn = screen.getByRole('button', { name: /All Categories/i });
    fireEvent.click(backBtn);
    expect(screen.getByText(/8 CATEGORIES • 50\+ VISUALIZERS/i)).toBeTruthy();
  });

  it('should launch Visualizer Sheet (Level 3), switch code tabs, switch sibling algorithms, and navigate back', () => {
    render(<DsaLabView />);

    // Click on "1. Sorting Algorithms" Category card
    const sortingCard = screen.getByText(/1\. Sorting Algorithms/i);
    fireEvent.click(sortingCard);

    // Click on "Bubble Sort" to launch visualizer
    const bubbleSortCard = screen.getByText(/Bubble Sort/i);
    fireEvent.click(bubbleSortCard);

    // Now in Level 3 (Visualizer Canvas + Code Deck)
    expect(screen.getByText(/Best Time:/i)).toBeTruthy();
    expect(screen.getByText(/Average Time:/i)).toBeTruthy();

    // Switch Code Tabs (C++, Java, Pseudo)
    const cppBtn = screen.getByRole('button', { name: /C\+\+/i });
    fireEvent.click(cppBtn);

    const javaBtn = screen.getByRole('button', { name: /Java/i });
    fireEvent.click(javaBtn);

    const pseudoBtn = screen.getByRole('button', { name: /Pseudo/i });
    fireEvent.click(pseudoBtn);

    // Switch sibling algorithm via top dropdown selector
    const algoDropdown = screen.getByTitle(/Select Algorithm \/ Data Structure/i);
    fireEvent.change(algoDropdown, { target: { value: 'merge_sort' } });
    expect(screen.getAllByText(/Merge Sort/i).length).toBeGreaterThan(0);

    // Navigate back to Algorithm Deck
    const backToDeckBtn = screen.getByRole('button', { name: /Sorting Algorithms Deck/i });
    fireEvent.click(backToDeckBtn);
    expect(screen.getByText(/All Categories/i)).toBeTruthy();

    // Navigate back to All Hubs
    const backToCategoriesBtn = screen.getByRole('button', { name: /All Categories/i });
    fireEvent.click(backToCategoriesBtn);
    expect(screen.getByText(/8 CATEGORIES • 50\+ VISUALIZERS/i)).toBeTruthy();
  });
});
