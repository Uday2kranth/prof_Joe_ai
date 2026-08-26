import { describe, it, expect } from 'vitest';
import { computeOLS, gradientDescentStep, type RegDataPoint } from '../../utils/math_studio/linearRegression';

describe('Linear Regression & Ordinary Least Squares (OLS) Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should compute exact slope m = 2 and intercept b = 1 for points (1,3), (2,5), (3,7)', () => {
      const data: RegDataPoint[] = [
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ];
      const res = computeOLS(data);

      expect(res.slope).toBeCloseTo(2.0, 6);
      expect(res.intercept).toBeCloseTo(1.0, 6);
      expect(res.r2).toBeCloseTo(1.0, 6); // Perfect collinearity
      expect(res.pearsonR).toBeCloseTo(1.0, 6);
      expect(res.rss).toBeCloseTo(0.0, 6);
    });

    it('should compute zero slope for horizontal data (1,4), (2,4), (3,4)', () => {
      const data: RegDataPoint[] = [
        { x: 1, y: 4 },
        { x: 2, y: 4 },
        { x: 3, y: 4 },
      ];
      const res = computeOLS(data);

      expect(res.slope).toBeCloseTo(0.0, 6);
      expect(res.intercept).toBeCloseTo(4.0, 6);
    });
  });

  describe('Pillar 2: Mathematical Invariants', () => {
    it('should satisfy R^2 bounds invariant: 0 <= R^2 <= 1', () => {
      const noisyData: RegDataPoint[] = [
        { x: 1, y: 2.1 },
        { x: 2, y: 3.8 },
        { x: 3, y: 6.2 },
        { x: 4, y: 7.9 },
        { x: 5, y: 10.5 },
      ];
      const res = computeOLS(noisyData);

      expect(res.r2).toBeGreaterThanOrEqual(0);
      expect(res.r2).toBeLessThanOrEqual(1);
      expect(res.pearsonR).toBeGreaterThan(0.9);
    });

    it('should decrease loss monotonically during Gradient Descent steps', () => {
      const data: RegDataPoint[] = [
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: 6 },
      ];

      let slope = 0;
      let intercept = 0;
      const lr = 0.05;

      const step1 = gradientDescentStep(data, slope, intercept, lr);
      const step2 = gradientDescentStep(data, step1.newSlope, step1.newIntercept, lr);

      expect(step2.cost).toBeLessThan(step1.cost);
    });
  });

  describe('Pillar 3: Chaos & Divide-by-Zero Stress Cases', () => {
    it('should handle vertical collinear data without divide-by-zero crash', () => {
      const verticalData: RegDataPoint[] = [
        { x: 2, y: 1 },
        { x: 2, y: 3 },
        { x: 2, y: 5 },
      ];
      const res = computeOLS(verticalData);
      expect(res.slope).not.toBeNaN();
      expect(res.intercept).not.toBeNaN();
    });

    it('should handle empty and single-point datasets', () => {
      expect(computeOLS([]).slope).toBe(0);
      expect(computeOLS([{ x: 3, y: 8 }]).intercept).toBe(8);
    });
  });
});
