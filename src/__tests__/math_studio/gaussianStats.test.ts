import { describe, it, expect } from 'vitest';
import { normalPdf, normalCdf, studentTPdf, bivariateNormalPdf } from '../../utils/math_studio/gaussianStats';

describe('Gaussian & Student-t Statistical Distribution Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should compute standard normal peak at mu = 0 equal to 1/sqrt(2*pi) ~= 0.39894228', () => {
      const peak = normalPdf(0, 0, 1);
      expect(peak).toBeCloseTo(0.39894228, 5);
    });

    it('should match textbook standard normal CDF oracle at Z = 0 (50th percentile)', () => {
      expect(normalCdf(0, 0, 1)).toBeCloseTo(0.5000, 4);
    });

    it('should match textbook standard normal CDF oracle at Z = 1.96 (97.5th percentile)', () => {
      // Z = 1.96 corresponds to 0.975002 in standard normal Z-tables
      expect(normalCdf(1.96, 0, 1)).toBeCloseTo(0.9750, 3);
    });

    it('should match textbook standard normal CDF oracle at Z = 2.576 (99.5th percentile)', () => {
      expect(normalCdf(2.576, 0, 1)).toBeCloseTo(0.9950, 3);
    });

    it('should demonstrate Student-t convergence to Gaussian as degrees of freedom nu -> inf', () => {
      const tVal = 1.5;
      const tPdfNu1000 = studentTPdf(tVal, 1000);
      const normalPdfVal = normalPdf(tVal, 0, 1);
      expect(tPdfNu1000).toBeCloseTo(normalPdfVal, 2);
    });
  });

  describe('Pillar 2: Mathematical & Symmetry Invariants', () => {
    it('should satisfy CDF symmetry invariant: CDF(-z) = 1 - CDF(z)', () => {
      const zValues = [0.5, 1.0, 1.645, 1.96, 2.58, 3.0];
      for (const z of zValues) {
        const cdfPos = normalCdf(z, 0, 1);
        const cdfNeg = normalCdf(-z, 0, 1);
        expect(cdfPos + cdfNeg).toBeCloseTo(1.0, 5);
      }
    });

    it('should satisfy Empirical 68-95-99.7 Rule invariants', () => {
      const p1Sigma = normalCdf(1, 0, 1) - normalCdf(-1, 0, 1);
      const p2Sigma = normalCdf(2, 0, 1) - normalCdf(-2, 0, 1);
      const p3Sigma = normalCdf(3, 0, 1) - normalCdf(-3, 0, 1);

      expect(p1Sigma).toBeCloseTo(0.6827, 3); // 68.27%
      expect(p2Sigma).toBeCloseTo(0.9545, 3); // 95.45%
      expect(p3Sigma).toBeCloseTo(0.9973, 3); // 99.73%
    });

    it('should satisfy Bivariate Normal correlation bounds invariant', () => {
      const pZeroCorr = bivariateNormalPdf(0, 0, 0, 0, 1, 1, 0);
      expect(pZeroCorr).toBeCloseTo(1 / (2 * Math.PI), 4);
    });
  });

  describe('Pillar 3: Boundary & Stress Invariants', () => {
    it('should handle extreme Z values without NaN or overflow', () => {
      expect(normalCdf(-10, 0, 1)).toBeCloseTo(0, 5);
      expect(normalCdf(10, 0, 1)).toBeCloseTo(1, 5);
    });

    it('should handle zero or negative standard deviation gracefully', () => {
      expect(normalPdf(0, 0, 0)).toBe(0);
      expect(normalPdf(0, 0, -1)).toBe(0);
    });
  });
});
