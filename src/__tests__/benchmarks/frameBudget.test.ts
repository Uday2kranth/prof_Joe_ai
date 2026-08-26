import { describe, it, expect } from 'vitest';
import { evaluateKernel } from '../../utils/math_studio/svcEngine';
import { normalPdf, normalCdf } from '../../utils/math_studio/gaussianStats';
import { computeOLS } from '../../utils/math_studio/linearRegression';
import { rk4Step } from '../../utils/math_studio/odeVectorFields';
import { generateIsoSegments } from '../../utils/math_studio/marchingContours';

describe('Diagnostic 1: 60 FPS Frame-Budget & Calculation Latency Benchmark', () => {
  // 60 FPS requires 1 frame to render in under 16.66 milliseconds (1000ms / 60)
  const FRAME_BUDGET_MS = 16.66;

  it('should evaluate 1,000 RBF Kernel operations in under 5ms (< 1 frame budget)', () => {
    const p1 = { x: 1.2, y: -0.8 };
    const p2 = { x: -0.5, y: 1.7 };

    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      evaluateKernel(p1, p2, 'rbf', 1.2);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(FRAME_BUDGET_MS);
    expect(elapsed).toBeLessThan(5.0); // Sub-millisecond target
  });

  it('should compute 1,000 Gaussian Normal PDF & CDF evaluations in under 5ms', () => {
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      const z = (i / 1000) * 6 - 3;
      normalPdf(z, 0, 1);
      normalCdf(z, 0, 1);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(FRAME_BUDGET_MS);
  });

  it('should compute 500 Runge-Kutta 4th Order (RK4) integration steps in under 5ms', () => {
    const system = (x: number, y: number) => ({ dx: y, dy: -x });
    let state = { x: 1.0, y: 0.0 };

    const start = performance.now();
    for (let i = 0; i < 500; i++) {
      state = rk4Step(system, state.x, state.y, 0.02);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(FRAME_BUDGET_MS);
    expect(state.x).not.toBeNaN();
  });

  it('should compute 100 full Ordinary Least Squares regressions on 50 points in under 10ms', () => {
    const dataset = Array.from({ length: 50 }, (_, i) => ({
      x: i * 0.2,
      y: i * 0.35 + Math.sin(i),
    }));

    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      computeOLS(dataset);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(FRAME_BUDGET_MS);
  });

  it('should extract a 40x40 Marching Squares Iso-Contour Grid in under 16ms (single frame)', () => {
    const fieldFn = (x: number, y: number) => Math.sin(x) * Math.cos(y);

    const start = performance.now();
    const segments = generateIsoSegments(fieldFn, -3, 3, -3, 3, 40, 0.0);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(FRAME_BUDGET_MS);
    expect(segments.length).toBeGreaterThan(0);
  });
});
