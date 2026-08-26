import { describe, it, expect } from 'vitest';
import {
  getFourierHarmonics,
  evaluateFourierSeries,
  apply2DTransform,
  compute2DMatrixDeterminant
} from '../../utils/math_studio/fourierHarmonics';

describe('Fourier Series & 2D Vector Spaces Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should generate odd harmonic coefficients for Square Wave (1, 3, 5...)', () => {
      const harmonics = getFourierHarmonics('square', 3);
      expect(harmonics.length).toBe(3);
      expect(harmonics[0].frequency).toBe(1);
      expect(harmonics[0].amplitude).toBeCloseTo(4 / Math.PI, 5); // 1.2732
      expect(harmonics[1].frequency).toBe(3);
      expect(harmonics[1].amplitude).toBeCloseTo(4 / (3 * Math.PI), 5); // 0.4244
      expect(harmonics[2].frequency).toBe(5);
      expect(harmonics[2].amplitude).toBeCloseTo(4 / (5 * Math.PI), 5); // 0.2546
    });

    it('should evaluate Fourier Square Wave at t = pi / (2 * omega) close to 1.0', () => {
      const harmonics = getFourierHarmonics('square', 25);
      const val = evaluateFourierSeries(harmonics, Math.PI / 2, 1.0);
      // Square wave height = 1.0
      expect(val).toBeCloseTo(1.0, 1);
    });

    it('should compute exact 2D Matrix Determinant (Area Scale Factor)', () => {
      const matrix: [[number, number], [number, number]] = [
        [2, 3],
        [1, 4]
      ];
      // det = 2*4 - 3*1 = 5
      const det = compute2DMatrixDeterminant(matrix);
      expect(det).toBe(5);
    });
  });

  describe('Pillar 2: Mathematical Invariants & Basis Transformations', () => {
    it('should map origin (0, 0) to origin under any linear transformation', () => {
      const matrix: [[number, number], [number, number]] = [
        [1.7, -3.2],
        [4.1, 0.9]
      ];
      const res = apply2DTransform(0, 0, matrix);
      expect(res.x).toBe(0);
      expect(res.y).toBe(0);
    });

    it('should preserve standard basis vectors mapping to matrix columns', () => {
      const matrix: [[number, number], [number, number]] = [
        [3, -1],
        [2, 5]
      ];
      const iHat = apply2DTransform(1, 0, matrix);
      const jHat = apply2DTransform(0, 1, matrix);

      expect(iHat.x).toBe(3);
      expect(iHat.y).toBe(2);
      expect(jHat.x).toBe(-1);
      expect(jHat.y).toBe(5);
    });
  });
});
