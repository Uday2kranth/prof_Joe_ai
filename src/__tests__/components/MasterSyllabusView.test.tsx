// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MasterSyllabusView } from '../../components/MasterSyllabusView';

describe('MasterSyllabusView Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the Syllabus & Roadmaps view with both navigation tabs', () => {
    render(<MasterSyllabusView />);
    
    expect(screen.getAllByText(/Syllabus & Roadmaps/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Syllabus Explorer/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Interactive Roadmaps/i })).toBeDefined();
  });

  it('should switch between subject streams via the Bento deck', () => {
    render(<MasterSyllabusView />);
    
    // Switch to AI & Machine Learning
    const aiStreamBtn = screen.getByRole('heading', { name: /AI & Machine Learning/i });
    fireEvent.click(aiStreamBtn);
    expect(screen.getByText(/Linear & Logistic Regression, Softmax & Cross-Entropy Loss/i)).toBeDefined();

    // Switch to DSA & Algorithms
    const dsaStreamBtn = screen.getByRole('heading', { name: /DSA & Algorithms/i });
    fireEvent.click(dsaStreamBtn);
    expect(screen.getByText(/Self-Balancing AVL Trees & Height-Restoring Rotations/i)).toBeDefined();
  });

  it('should filter by academic education level (e.g. Postgraduate Core)', () => {
    render(<MasterSyllabusView />);
    
    // Click Postgraduate level filter
    const pgFilterBtn = screen.getByText(/Postgraduate & Master's Rigor/i);
    fireEvent.click(pgFilterBtn);

    // Should show Level 400-500 topics
    expect(screen.getByText(/Singular Value Decomposition \(SVD\) & Low-Rank Approximation/i)).toBeDefined();
    expect(screen.getByText(/Multi-Layer Perceptrons, Universal Approximations & Activations/i)).toBeDefined();
  });

  it('should filter topics in real-time when typing in search input', () => {
    render(<MasterSyllabusView />);
    
    const searchInput = screen.getByPlaceholderText(/Search syllabus modules/i);
    fireEvent.change(searchInput, { target: { value: 'SVD' } });

    // Should find SVD topic
    expect(screen.getByText(/Singular Value Decomposition \(SVD\) & Low-Rank Approximation/i)).toBeDefined();
    // Should NOT show basic algebra
    expect(screen.queryByText(/Elementary Algebra, Functions & Polynomials/i)).toBeNull();
  });

  it('should allow toggling topic mastery completion and persist in localStorage', () => {
    render(<MasterSyllabusView />);
    
    const markButtons = screen.getAllByTitle(/Mark as Mastered/i);
    expect(markButtons.length).toBeGreaterThan(0);

    fireEvent.click(markButtons[0]);
    expect(screen.getByTitle(/Mark as Incomplete/i)).toBeDefined();
    expect(localStorage.getItem('prof_joe_master_syllabus_completed')).not.toBeNull();
  });

  it('should switch to Interactive Roadmaps tab and allow selecting career tracks', () => {
    render(<MasterSyllabusView />);
    
    // Click Interactive Roadmaps tab
    const roadmapsTab = screen.getByRole('button', { name: /Interactive Roadmaps/i });
    fireEvent.click(roadmapsTab);

    // Verify Career Tracks are shown
    expect(screen.getByText(/Select Target Specialization & Career Track/i)).toBeDefined();
    expect(screen.getAllByText(/AI Research Scientist & Theoretician/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Quantitative Analyst & Statistical Modeler/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Core Algorithm & Systems Architect/i)).toBeDefined();

    // Select Quant Analyst track
    const quantTracks = screen.getAllByText(/Quantitative Analyst & Statistical Modeler/i);
    fireEvent.click(quantTracks[0]);

    expect(screen.getByText(/Visual Milestone DAG: Quantitative Analyst & Statistical Modeler/i)).toBeDefined();
  });

  it('should trigger navigation callback when clicking an interactive lab launcher button', () => {
    const handleNavigate = vi.fn();
    render(<MasterSyllabusView onNavigateWorkspace={handleNavigate} />);

    // In All Streams, find an interactive lab button
    const launchLabButtons = screen.getAllByText(/Open 2D\/3D Linear Matrix Transformation Lab/i);
    expect(launchLabButtons.length).toBeGreaterThan(0);

    fireEvent.click(launchLabButtons[0]);
    expect(handleNavigate).toHaveBeenCalledWith('test_diagrams');
  });

  it('should navigate back to home hub when onBackToHub is clicked', () => {
    const handleBack = vi.fn();
    render(<MasterSyllabusView onBackToHub={handleBack} />);

    const backBtn = screen.getByRole('button', { name: /Home Hub/i });
    fireEvent.click(backBtn);
    expect(handleBack).toHaveBeenCalledTimes(1);
  });
});
