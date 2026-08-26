import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { sigmoid, softmax } from '../../utils/math_studio/logisticSoftmax';
import { evaluateKernel } from '../../utils/math_studio/svcEngine';
import { normalPdf, normalCdf } from '../../utils/math_studio/gaussianStats';
import { computeOLS } from '../../utils/math_studio/linearRegression';
import { epsilonLoss } from '../../utils/math_studio/svrEngine';

describe('Property-Based Invariant Fuzzing (fast-check)', () => {
  describe('Universal Logistic & Softmax Invariants', () => {
    it('Property: Sigmoid output must ALWAYS be bounded strictly in [0, 1] for ANY real input', () => {
      fc.assert(
        fc.property(fc.double({ min: -1e6, max: 1e6, noNaN: true }), (z) => {
          const val = sigmoid(z);
          return val >= 0 && val <= 1 && !Number.isNaN(val);
        }),
        { numRuns: 500 }
      );
    });

    it('Property: Sigmoid is strictly monotonic: z1 < z2 ==> sigmoid(z1) <= sigmoid(z2)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -50, max: 50, noNaN: true }),
          fc.double({ min: 0.001, max: 50, noNaN: true }),
          (z, delta) => {
            return sigmoid(z) <= sigmoid(z + delta);
          }
        ),
        { numRuns: 300 }
      );
    });

    it('Property: Sigmoid symmetry invariant sigma(-z) + sigma(z) === 1.0', () => {
      fc.assert(
        fc.property(fc.double({ min: -30, max: 30, noNaN: true }), (z) => {
          const sum = sigmoid(-z) + sigmoid(z);
          return Math.abs(sum - 1.0) < 1e-7;
        }),
        { numRuns: 300 }
      );
    });

    it('Property: Softmax probabilities always sum to exactly 1.0 for arbitrary dimension and logits', () => {
      fc.assert(
        fc.property(
          fc.array(fc.double({ min: -100, max: 100, noNaN: true }), { minLength: 2, maxLength: 20 }),
          (logits) => {
            const probs = softmax(logits);
            const sum = probs.reduce((acc, v) => acc + v, 0);
            const allBounded = probs.every((p) => p >= 0 && p <= 1);
            return Math.abs(sum - 1.0) < 1e-6 && allBounded;
          }
        ),
        { numRuns: 300 }
      );
    });
  });

  describe('Mercer Kernel & SVC Support Vector Invariants', () => {
    it('Property: Mercer Symmetry Condition K(a, b) === K(b, a) for arbitrary RBF, Linear, and Poly kernels', () => {
      fc.assert(
        fc.property(
          fc.record({ x: fc.double({ min: -50, max: 50, noNaN: true }), y: fc.double({ min: -50, max: 50, noNaN: true }) }),
          fc.record({ x: fc.double({ min: -50, max: 50, noNaN: true }), y: fc.double({ min: -50, max: 50, noNaN: true }) }),
          fc.double({ min: 0.1, max: 10, noNaN: true }),
          (pA, pB, gamma) => {
            const kRbfAB = evaluateKernel(pA, pB, 'rbf', gamma);
            const kRbfBA = evaluateKernel(pB, pA, 'rbf', gamma);

            const kPolyAB = evaluateKernel(pA, pB, 'poly', gamma, 3);
            const kPolyBA = evaluateKernel(pB, pA, 'poly', gamma, 3);

            return Math.abs(kRbfAB - kRbfBA) < 1e-9 && Math.abs(kPolyAB - kPolyBA) < 1e-9;
          }
        ),
        { numRuns: 300 }
      );
    });

    it('Property: RBF Kernel self-similarity is always identically 1.0 (K(x, x) === 1.0)', () => {
      fc.assert(
        fc.property(
          fc.record({ x: fc.double({ min: -100, max: 100, noNaN: true }), y: fc.double({ min: -100, max: 100, noNaN: true }) }),
          fc.double({ min: 0.01, max: 50, noNaN: true }),
          (p, gamma) => {
            const kSelf = evaluateKernel(p, p, 'rbf', gamma);
            return Math.abs(kSelf - 1.0) < 1e-9;
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('Gaussian & Statistics Invariants', () => {
    it('Property: Standard Normal CDF is strictly monotonic and bounded in [0, 1]', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -10, max: 10, noNaN: true }),
          fc.double({ min: 0.001, max: 5, noNaN: true }),
          (z, dz) => {
            const cdf1 = normalCdf(z, 0, 1);
            const cdf2 = normalCdf(z + dz, 0, 1);
            return cdf1 >= 0 && cdf2 <= 1 && cdf1 <= cdf2;
          }
        ),
        { numRuns: 300 }
      );
    });

    it('Property: Gaussian PDF is always non-negative and symmetric around mu', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -50, max: 50, noNaN: true }),
          fc.double({ min: 0.1, max: 20, noNaN: true }),
          fc.double({ min: 0, max: 50, noNaN: true }),
          (mu, sigma, offset) => {
            const left = normalPdf(mu - offset, mu, sigma);
            const right = normalPdf(mu + offset, mu, sigma);
            return left >= 0 && Math.abs(left - right) < 1e-9;
          }
        ),
        { numRuns: 300 }
      );
    });
  });

  describe('SVR & Linear Regression Invariants', () => {
    it('Property: Epsilon loss is always non-negative and zero whenever |y - yHat| <= epsilon', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -100, max: 100, noNaN: true }),
          fc.double({ min: -100, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 50, noNaN: true }),
          (y, yHat, eps) => {
            const loss = epsilonLoss(y, yHat, eps);
            const diff = Math.abs(y - yHat);
            if (diff <= eps) {
              return loss === 0;
            } else {
              return Math.abs(loss - (diff - eps)) < 1e-7;
            }
          }
        ),
        { numRuns: 300 }
      );
    });

    it('Property: Linear Regression R^2 is bounded <= 1.0 for any valid non-degenerate point set', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.double({ min: -100, max: 100, noNaN: true }),
              y: fc.double({ min: -100, max: 100, noNaN: true }),
            }),
            { minLength: 3, maxLength: 30 }
          ),
          (points) => {
            const xVals = points.map((p) => p.x);
            const minX = Math.min(...xVals);
            const maxX = Math.max(...xVals);
            if (Math.abs(maxX - minX) < 1e-5) return true;

            const result = computeOLS(points);
            return result.r2 <= 1.00001 && !Number.isNaN(result.slope) && !Number.isNaN(result.intercept);
          }
        ),
        { numRuns: 200 }
      );
    });
  });
});
