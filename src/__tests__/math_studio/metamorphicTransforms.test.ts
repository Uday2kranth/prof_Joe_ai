import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { computeOLS } from '../../utils/math_studio/linearRegression';
import { normalPdf } from '../../utils/math_studio/gaussianStats';
import { evaluateKernel } from '../../utils/math_studio/svcEngine';
import { compute2x2Determinant } from '../../utils/math_studio/multilineSystems';

describe('Metamorphic Transformation Testing Suite', () => {
  describe('Linear Regression Metamorphic Laws', () => {
    it('Metamorphic Law 1 (Vertical Shift): y -> y + C preserves slope m and R^2 while b -> b + C', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.double({ min: -50, max: 50, noNaN: true }),
              y: fc.double({ min: -50, max: 50, noNaN: true }),
            }),
            { minLength: 4, maxLength: 25 }
          ),
          fc.double({ min: -50, max: 50, noNaN: true }),
          (points, shiftC) => {
            const xVals = points.map((p) => p.x);
            const yVals = points.map((p) => p.y);
            const xRange = Math.max(...xVals) - Math.min(...xVals);
            const yRange = Math.max(...yVals) - Math.min(...yVals);
            if (xRange < 1e-3 || yRange < 1e-3) return true; // skip degenerate/collinear

            const orig = computeOLS(points);
            const shiftedPoints = points.map((p) => ({ x: p.x, y: p.y + shiftC }));
            const shifted = computeOLS(shiftedPoints);

            const slopeSame = Math.abs(orig.slope - shifted.slope) < 1e-4;
            const interceptShifted = Math.abs(shifted.intercept - (orig.intercept + shiftC)) < 1e-4;
            const r2Same = Math.abs(orig.r2 - shifted.r2) < 1e-4;

            return slopeSame && interceptShifted && r2Same;
          }
        ),
        { numRuns: 200 }
      );
    });

    it('Metamorphic Law 2 (Horizontal Shift): x -> x + K preserves slope m and R^2 while b -> b - m*K', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.double({ min: -50, max: 50, noNaN: true }),
              y: fc.double({ min: -50, max: 50, noNaN: true }),
            }),
            { minLength: 4, maxLength: 25 }
          ),
          fc.double({ min: -50, max: 50, noNaN: true }),
          (points, shiftK) => {
            const xVals = points.map((p) => p.x);
            const yVals = points.map((p) => p.y);
            const xRange = Math.max(...xVals) - Math.min(...xVals);
            const yRange = Math.max(...yVals) - Math.min(...yVals);
            if (xRange < 1e-3 || yRange < 1e-3) return true;

            const orig = computeOLS(points);
            const shiftedPoints = points.map((p) => ({ x: p.x + shiftK, y: p.y }));
            const shifted = computeOLS(shiftedPoints);

            const slopeSame = Math.abs(orig.slope - shifted.slope) < 1e-4;
            const expectedIntercept = orig.intercept - orig.slope * shiftK;
            const interceptCorrect = Math.abs(shifted.intercept - expectedIntercept) < 1e-3;
            const r2Same = Math.abs(orig.r2 - shifted.r2) < 1e-4;

            return slopeSame && interceptCorrect && r2Same;
          }
        ),
        { numRuns: 200 }
      );
    });

    it('Metamorphic Law 3 (Uniform Y-Scaling): y -> S * y scales slope & intercept by S and preserves R^2', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              x: fc.double({ min: -50, max: 50, noNaN: true }),
              y: fc.double({ min: -50, max: 50, noNaN: true }),
            }),
            { minLength: 4, maxLength: 25 }
          ),
          fc.double({ min: 0.1, max: 20, noNaN: true }),
          (points, scaleS) => {
            const xVals = points.map((p) => p.x);
            const yVals = points.map((p) => p.y);
            const xRange = Math.max(...xVals) - Math.min(...xVals);
            const yRange = Math.max(...yVals) - Math.min(...yVals);
            if (xRange < 1e-3 || yRange < 1e-3) return true;

            const orig = computeOLS(points);
            const scaledPoints = points.map((p) => ({ x: p.x, y: p.y * scaleS }));
            const scaled = computeOLS(scaledPoints);

            const slopeScaled = Math.abs(scaled.slope - orig.slope * scaleS) < 1e-4;
            const interceptScaled = Math.abs(scaled.intercept - orig.intercept * scaleS) < 1e-4;
            const r2Same = Math.abs(orig.r2 - scaled.r2) < 1e-4;

            return slopeScaled && interceptScaled && r2Same;
          }
        ),
        { numRuns: 200 }
      );
    });
  });

  describe('Gaussian & Kernel Metamorphic Laws', () => {
    it('Metamorphic Law 4 (RBF Translation Invariance): K(a + v, b + v) === K(a, b)', () => {
      fc.assert(
        fc.property(
          fc.record({ x: fc.double({ min: -50, max: 50, noNaN: true }), y: fc.double({ min: -50, max: 50, noNaN: true }) }),
          fc.record({ x: fc.double({ min: -50, max: 50, noNaN: true }), y: fc.double({ min: -50, max: 50, noNaN: true }) }),
          fc.record({ x: fc.double({ min: -50, max: 50, noNaN: true }), y: fc.double({ min: -50, max: 50, noNaN: true }) }),
          fc.double({ min: 0.1, max: 10, noNaN: true }),
          (pA, pB, v, gamma) => {
            const kOrig = evaluateKernel(pA, pB, 'rbf', gamma);
            const pAShifted = { x: pA.x + v.x, y: pA.y + v.y };
            const pBShifted = { x: pB.x + v.x, y: pB.y + v.y };
            const kShifted = evaluateKernel(pAShifted, pBShifted, 'rbf', gamma);

            return Math.abs(kOrig - kShifted) < 1e-8;
          }
        ),
        { numRuns: 250 }
      );
    });

    it('Metamorphic Law 5 (Gaussian Shift Equivalence): Normal(x | mu, sigma) === Normal(x - mu | 0, sigma)', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -50, max: 50, noNaN: true }),
          fc.double({ min: -50, max: 50, noNaN: true }),
          fc.double({ min: 0.1, max: 20, noNaN: true }),
          (x, mu, sigma) => {
            const pdfGeneral = normalPdf(x, mu, sigma);
            const pdfStandard = normalPdf(x - mu, 0, sigma);
            return Math.abs(pdfGeneral - pdfStandard) < 1e-9;
          }
        ),
        { numRuns: 300 }
      );
    });
  });

  describe('Linear Systems 2D Determinant Transformation Law', () => {
    it('Metamorphic Law 6 (Matrix Scale Invariance): det(c * M) === c^2 * det(M) for 2x2 matrix', () => {
      fc.assert(
        fc.property(
          fc.double({ min: -20, max: 20, noNaN: true }),
          fc.double({ min: -20, max: 20, noNaN: true }),
          fc.double({ min: -20, max: 20, noNaN: true }),
          fc.double({ min: -20, max: 20, noNaN: true }),
          fc.double({ min: -10, max: 10, noNaN: true }),
          (a, b, c, d, scale) => {
            const detOrig = compute2x2Determinant(a, b, c, d);
            const detScaled = compute2x2Determinant(a * scale, b * scale, c * scale, d * scale);
            const expected = scale * scale * detOrig;
            return Math.abs(detScaled - expected) < 1e-6;
          }
        ),
        { numRuns: 250 }
      );
    });
  });
});
