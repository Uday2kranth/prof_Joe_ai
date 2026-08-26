import { describe, it, expect } from 'vitest';
import fixtures from '../fixtures/goldenMathFixtures.json';
import { normalCdf } from '../../utils/math_studio/gaussianStats';
import { computeOLS } from '../../utils/math_studio/linearRegression';
import { epsilonLoss, calculateSvrSlacks } from '../../utils/math_studio/svrEngine';
import { sigmoid } from '../../utils/math_studio/logisticSoftmax';
import { rk4Step, classifyFixedPoint } from '../../utils/math_studio/odeVectorFields';

describe('Golden Master Reference Verification (Scikit-Learn & SciPy Fixtures)', () => {
  describe('Gaussian Normal Z-Table Fixture', () => {
    it('should match standard textbook Z-table CDF values within tolerance', () => {
      for (const row of fixtures.gaussianZTable) {
        const calculated = normalCdf(row.z, 0, 1);
        expect(calculated).toBeCloseTo(row.expectedCdf, 3);
      }
    });
  });

  describe('Scikit-Learn OLS Benchmark Fixture', () => {
    it('should compute exact slope, intercept, R2 and Pearson r matching Scikit-Learn', () => {
      const { points, expectedSlope, expectedIntercept, expectedRSquared, expectedPearsonR } = fixtures.olsBenchmark;
      const res = computeOLS(points);

      expect(res.slope).toBeCloseTo(expectedSlope, 4);
      expect(res.intercept).toBeCloseTo(expectedIntercept, 4);
      expect(res.r2).toBeCloseTo(expectedRSquared, 4);
      expect(res.pearsonR).toBeCloseTo(expectedPearsonR, 4);
    });
  });

  describe('Scikit-Learn SVR Reference Fixture', () => {
    it('should compute exact epsilon loss and slack vectors matching SVR reference', () => {
      const { epsilon, cases } = fixtures.svrReference;
      for (const item of cases) {
        const loss = epsilonLoss(item.y, item.yHat, epsilon);
        expect(loss).toBeCloseTo(item.expectedLoss, 5);

        const slacks = calculateSvrSlacks(item.y, item.yHat, epsilon);
        expect(slacks.xi).toBeCloseTo(item.expectedXi, 5);
        expect(slacks.xiStar).toBeCloseTo(item.expectedXiStar, 5);
      }
    });
  });

  describe('Logistic Activation Fixture', () => {
    it('should evaluate Sigmoid matching floating-point reference table', () => {
      for (const row of fixtures.logisticActivation) {
        const calculated = sigmoid(row.z);
        expect(calculated).toBeCloseTo(row.expectedSigmoid, 5);
      }
    });
  });

  describe('SciPy RK4 Harmonic Oscillator Trajectory Fixture', () => {
    it('should integrate harmonic oscillator ODE x_dot = y, y_dot = -x matching SciPy RK4', () => {
      const system = (x: number, y: number) => ({ dx: y, dy: -x });
      const { initial, dt, step1Expected, step2Expected } = fixtures.rk4HarmonicOscillator;

      const step1 = rk4Step(system, initial.x, initial.y, dt);
      expect(step1.x).toBeCloseTo(step1Expected.x, 4);
      expect(step1.y).toBeCloseTo(step1Expected.y, 4);

      const step2 = rk4Step(system, step1.x, step1.y, dt);
      expect(step2.x).toBeCloseTo(step2Expected.x, 4);
      expect(step2.y).toBeCloseTo(step2Expected.y, 4);
    });
  });

  describe('Jacobian Stability Classification Fixture', () => {
    it('should accurately classify fixed points in Trace-Determinant plane', () => {
      for (const item of fixtures.jacobianStability) {
        const matrix = item.matrix as [[number, number], [number, number]];
        const res = classifyFixedPoint(matrix);

        expect(res.trace).toBe(item.expectedTrace);
        expect(res.determinant).toBe(item.expectedDet);

        if (item.expectedClassification === 'saddle_point') {
          expect(res.stability).toBe('Saddle Point');
        } else if (item.expectedClassification === 'center_or_neutral') {
          expect(res.stability).toBe('Center (Neutral Orbit)');
        } else if (item.expectedClassification === 'stable_sink') {
          expect(res.stability).toBe('Stable Node (Sink)');
        } else if (item.expectedClassification === 'unstable_source') {
          expect(res.stability).toBe('Unstable Node (Source)');
        }
      }
    });
  });
});
