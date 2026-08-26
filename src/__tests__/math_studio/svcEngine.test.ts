import { describe, it, expect } from 'vitest';
import {
  evaluateKernel,
  computeLinearDecision,
  calculatePointSlackAndAlpha,
  computeClassificationMetrics,
  paraboloidLift,
  type Point2D
} from '../../utils/math_studio/svcEngine';

describe('Support Vector Classifier (SVC) Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should compute linear hyperplane margin width M = 2 / ||w||', () => {
      const w: [number, number] = [3, 4]; // ||w|| = 5
      const normW = Math.hypot(w[0], w[1]);
      const margin = 2 / normW;
      expect(margin).toBeCloseTo(0.4, 5);
    });

    it('should evaluate RBF Kernel self-similarity K(x, x) = 1.0', () => {
      const p = { x: 1.5, y: -2.3 };
      const kVal = evaluateKernel(p, p, 'rbf', 1.2);
      expect(kVal).toBe(1.0);
    });

    it('should evaluate RBF similarity decay with distance', () => {
      const p1 = { x: 0, y: 0 };
      const p2 = { x: 1, y: 0 };
      const gamma = 1.5;
      const kVal = evaluateKernel(p1, p2, 'rbf', gamma);
      // exp(-1.5 * 1^2) = exp(-1.5) ~= 0.22313
      expect(kVal).toBeCloseTo(Math.exp(-1.5), 5);
    });

    it('should evaluate Polynomial Kernel (0.7 * <x, y> + 1)^d oracle', () => {
      const p1 = { x: 2, y: 0 };
      const p2 = { x: 1, y: 0 };
      const degree = 3;
      const kVal = evaluateKernel(p1, p2, 'poly', 1.0, degree);
      // (0.7 * 2 + 1)^3 = (2.4)^3 = 13.824
      expect(kVal).toBeCloseTo(13.824, 4);
    });
  });

  describe('Pillar 2: Mathematical & Invariant Properties', () => {
    it('should satisfy Kernel Symmetry: K(x_i, x_j) === K(x_j, x_i)', () => {
      const p1 = { x: -1.2, y: 3.4 };
      const p2 = { x: 0.8, y: -0.5 };
      expect(evaluateKernel(p1, p2, 'rbf', 1.4)).toBeCloseTo(evaluateKernel(p2, p1, 'rbf', 1.4), 8);
      expect(evaluateKernel(p1, p2, 'linear')).toBeCloseTo(evaluateKernel(p2, p1, 'linear'), 8);
      expect(evaluateKernel(p1, p2, 'poly', 1, 2)).toBeCloseTo(evaluateKernel(p2, p1, 'poly', 1, 2), 8);
    });

    it('should enforce Box Constraint 0 <= alpha_i <= C on Lagrange multipliers', () => {
      const boxC = 2.5;
      const testCases = [
        { fVal: 3.0, label: 1 as const },   // Well-classified interior
        { fVal: 1.0, label: 1 as const },   // Exactly on margin
        { fVal: 0.5, label: 1 as const },   // In margin gutter
        { fVal: -1.0, label: 1 as const },  // Misclassified violator
      ];

      for (const tc of testCases) {
        const { alpha, slack } = calculatePointSlackAndAlpha(tc.fVal, tc.label, boxC);
        expect(alpha).toBeGreaterThanOrEqual(0);
        expect(alpha).toBeLessThanOrEqual(boxC);
        expect(slack).toBeGreaterThanOrEqual(0);
      }
    });

    it('should correctly separate linearly separable dataset with 100% precision and recall', () => {
      const points: Point2D[] = [
        { x: -2, y: 2, label: 1 },
        { x: -1, y: 1, label: 1 },
        { x: 1, y: -1, label: -1 },
        { x: 2, y: -2, label: -1 }
      ];

      const w: [number, number] = [-1, 1];
      const b = 0;
      const metrics = computeClassificationMetrics(points, p => computeLinearDecision(p.x, p.y, w, b));

      expect(metrics.accuracy).toBe(1.0);
      expect(metrics.precision).toBe(1.0);
      expect(metrics.recall).toBe(1.0);
      expect(metrics.f1).toBe(1.0);
      expect(metrics.tp).toBe(2);
      expect(metrics.tn).toBe(2);
    });

    it('should map 2D concentric points to 3D linearly separable paraboloid coordinates', () => {
      const innerRadius = 0.5;
      const outerRadius = 2.0;
      const zInner = paraboloidLift(innerRadius, 0);
      const zOuter = paraboloidLift(outerRadius, 0);

      // z_outer must be strictly higher than z_inner
      expect(zOuter).toBeGreaterThan(zInner);
      // Horizontal plane threshold at (zInner + zOuter) / 2 linearly separates them
      const threshold = (zInner + zOuter) / 2;
      expect(zInner).toBeLessThan(threshold);
      expect(zOuter).toBeGreaterThan(threshold);
    });
  });

  describe('Pillar 3: Chaos & Boundary Stress Cases', () => {
    it('should handle empty dataset gracefully without crash', () => {
      const metrics = computeClassificationMetrics([], () => 0);
      expect(metrics.accuracy).toBe(1.0);
      expect(metrics.tp).toBe(0);
    });
  });
});
