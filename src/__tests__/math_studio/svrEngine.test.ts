import { describe, it, expect } from 'vitest';
import { epsilonLoss, calculateSvrSlacks, computeSvrLoss } from '../../utils/math_studio/svrEngine';

describe('Support Vector Regressor (SVR) Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should return 0 loss for points strictly inside epsilon-insensitive tube', () => {
      const epsilon = 0.5;
      const y = 2.3;
      const yHat = 2.5; // |2.3 - 2.5| = 0.2 < 0.5
      expect(epsilonLoss(y, yHat, epsilon)).toBe(0);
    });

    it('should compute exact linear loss for points outside epsilon tube', () => {
      const epsilon = 0.5;
      const y = 3.5;
      const yHat = 2.0; // |3.5 - 2.0| = 1.5 -> loss = 1.5 - 0.5 = 1.0
      expect(epsilonLoss(y, yHat, epsilon)).toBeCloseTo(1.0);
    });
  });

  describe('Pillar 2: Mathematical Invariants & Dual Slacks', () => {
    it('should compute xi > 0 and xi* = 0 when point is strictly above upper tube', () => {
      const epsilon = 0.3;
      const y = 4.0;
      const yHat = 3.0; // diff = 1.0 > 0.3
      const { xi, xiStar } = calculateSvrSlacks(y, yHat, epsilon);

      expect(xi).toBeCloseTo(0.7); // 1.0 - 0.3
      expect(xiStar).toBe(0);
    });

    it('should compute xi = 0 and xi* > 0 when point is strictly below lower tube', () => {
      const epsilon = 0.3;
      const y = 2.0;
      const yHat = 3.0; // diff = -1.0
      const { xi, xiStar } = calculateSvrSlacks(y, yHat, epsilon);

      expect(xi).toBe(0);
      expect(xiStar).toBeCloseTo(0.7);
    });

    it('should ensure non-negative slacks (xi >= 0 and xi* >= 0) for any input', () => {
      const testCases = [
        { y: 5, yHat: 2, eps: 1 },
        { y: 2, yHat: 5, eps: 1 },
        { y: 3, yHat: 3, eps: 1 },
      ];

      for (const tc of testCases) {
        const { xi, xiStar } = calculateSvrSlacks(tc.y, tc.yHat, tc.eps);
        expect(xi).toBeGreaterThanOrEqual(0);
        expect(xiStar).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Pillar 3: Boundary & Stress Cases', () => {
    it('should compute loss metrics on regression dataset', () => {
      const points = [
        { id: 1, x: 1, y: 2 },
        { id: 2, x: 2, y: 4 },
        { id: 3, x: 3, y: 6 },
      ];
      // Perfect linear predictor yHat = 2 * x
      const { mse, totalSlack } = computeSvrLoss(points, x => 2 * x, 0.5);
      expect(mse).toBe(0);
      expect(totalSlack).toBe(0);
    });
  });
});
