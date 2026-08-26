import { describe, it, expect } from 'vitest';
import { intersectLines, isPointFeasible, findFeasibleVertices, type LineEquation } from '../../utils/math_studio/multilineSystems';

describe('Multi-Line Systems & Linear Programming Geometry Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should find exact intersection of x + y = 4 and x - y = 0 at (2, 2)', () => {
      const l1: LineEquation = { id: 1, a: 1, b: 1, c: 4 };
      const l2: LineEquation = { id: 2, a: 1, b: -1, c: 0 };
      const res = intersectLines(l1, l2);

      expect(res.isParallel).toBe(false);
      expect(res.x).toBeCloseTo(2.0, 6);
      expect(res.y).toBeCloseTo(2.0, 6);
      expect(res.det).toBeCloseTo(-2.0, 6);
    });

    it('should detect parallel lines 2x + 3y = 6 and 2x + 3y = 12 with det = 0', () => {
      const l1: LineEquation = { id: 1, a: 2, b: 3, c: 6 };
      const l2: LineEquation = { id: 2, a: 2, b: 3, c: 12 };
      const res = intersectLines(l1, l2);

      expect(res.isParallel).toBe(true);
      expect(res.det).toBeCloseTo(0, 8);
    });
  });

  describe('Pillar 2: Feasible Region & Polytope Invariants', () => {
    it('should determine feasibility of candidate points inside half-plane constraints', () => {
      // Constraints: x >= 0, y >= 0, x + y <= 5
      const constraints: LineEquation[] = [
        { id: 1, a: 1, b: 0, c: 0, inequality: '>=' }, // x >= 0
        { id: 2, a: 0, b: 1, c: 0, inequality: '>=' }, // y >= 0
        { id: 3, a: 1, b: 1, c: 5, inequality: '<=' }, // x + y <= 5
      ];

      expect(isPointFeasible(1, 1, constraints)).toBe(true);
      expect(isPointFeasible(0, 5, constraints)).toBe(true);
      expect(isPointFeasible(3, 4, constraints)).toBe(false); // 3+4=7 > 5
      expect(isPointFeasible(-1, 2, constraints)).toBe(false); // x < 0
    });

    it('should identify all 3 corner vertices of the triangle simplex', () => {
      const constraints: LineEquation[] = [
        { id: 1, a: 1, b: 0, c: 0, inequality: '>=' },
        { id: 2, a: 0, b: 1, c: 0, inequality: '>=' },
        { id: 3, a: 1, b: 1, c: 5, inequality: '<=' },
      ];

      const vertices = findFeasibleVertices(constraints);
      expect(vertices.length).toBe(3);

      const hasOrigin = vertices.some(v => Math.hypot(v.x - 0, v.y - 0) < 1e-3);
      const hasXIntercept = vertices.some(v => Math.hypot(v.x - 5, v.y - 0) < 1e-3);
      const hasYIntercept = vertices.some(v => Math.hypot(v.x - 0, v.y - 5) < 1e-3);

      expect(hasOrigin).toBe(true);
      expect(hasXIntercept).toBe(true);
      expect(hasYIntercept).toBe(true);
    });
  });
});
