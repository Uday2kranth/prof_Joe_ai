import { describe, it, expect } from 'vitest';
import {
  numericalDerivative,
  numericalSecondDerivative,
  computeRiemannSum
} from '../../utils/math_studio/tangentsRiemann';

describe('Tangents, Derivatives & Riemann Sums Integration Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should compute numerical derivative of f(x) = x^3 at x = 2 equal to 3*(2^2) = 12', () => {
      const f = (x: number) => x * x * x;
      const df = numericalDerivative(f, 2);
      expect(df).toBeCloseTo(12.0, 4);
    });

    it('should compute numerical second derivative of f(x) = sin(x) at x = pi/2 equal to -1.0', () => {
      const f = (x: number) => Math.sin(x);
      const d2f = numericalSecondDerivative(f, Math.PI / 2);
      expect(d2f).toBeCloseTo(-1.0, 3);
    });

    it('should compute exact integral of f(x) = x^2 from 0 to 3 equal to 9.0 using Simpson Rule', () => {
      // Int_0^3 x^2 dx = [x^3 / 3]_0^3 = 27/3 = 9.0
      const f = (x: number) => x * x;
      const integralSimpson = computeRiemannSum(f, 0, 3, 10, 'simpson');
      expect(integralSimpson).toBeCloseTo(9.0, 5);
    });
  });

  describe('Pillar 2: Mathematical Convergence Hierarchy Invariants', () => {
    it('should demonstrate Simpson error is strictly lower than Left Rectangle error for smooth curves', () => {
      const f = (x: number) => Math.exp(x);
      const trueVal = Math.exp(2) - Math.exp(0); // Int_0^2 e^x dx

      const leftSum = computeRiemannSum(f, 0, 2, 20, 'left');
      const trapSum = computeRiemannSum(f, 0, 2, 20, 'trapezoid');
      const simpSum = computeRiemannSum(f, 0, 2, 20, 'simpson');

      const errLeft = Math.abs(leftSum - trueVal);
      const errTrap = Math.abs(trapSum - trueVal);
      const errSimp = Math.abs(simpSum - trueVal);

      expect(errSimp).toBeLessThan(errTrap);
      expect(errTrap).toBeLessThan(errLeft);
    });
  });
});
