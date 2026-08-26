import { describe, it, expect } from 'vitest';
import {
  rk4Step,
  computeJacobian,
  classifyFixedPoint,
  type ODESystemFn
} from '../../utils/math_studio/odeVectorFields';

describe('ODE Vector Fields & RK4 Phase Portrait Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should accurately step simple harmonic oscillator using RK4', () => {
      // dx/dt = y, dy/dt = -x (circular orbit with radius 1)
      const harmonicOscillator: ODESystemFn = (x, y) => ({ dx: y, dy: -x });
      
      let x = 1, y = 0;
      const dt = 0.05;
      const steps = 20;

      for (let i = 0; i < steps; i++) {
        const next = rk4Step(harmonicOscillator, x, y, dt);
        x = next.x;
        y = next.y;
      }

      // Energy Conservation: x^2 + y^2 should remain close to 1.0
      const radiusSq = x * x + y * y;
      expect(radiusSq).toBeCloseTo(1.0, 3);
    });

    it('should correctly classify Saddle Point when det(J) < 0', () => {
      // System with eigenvalues +1, -2 -> det = -2 < 0
      const saddleSystem: ODESystemFn = (x, y) => ({ dx: x, dy: -2 * y });
      const jacobian = computeJacobian(saddleSystem, 0, 0);
      const res = classifyFixedPoint(jacobian);

      expect(res.determinant).toBeLessThan(0);
      expect(res.stability).toBe('Saddle Point');
    });

    it('should correctly classify Stable Spiral (Focus Sink) when Tr < 0 and Delta < 0', () => {
      // Damped harmonic oscillator: dx/dt = y, dy/dt = -x - 0.5*y
      const dampedOsc: ODESystemFn = (x, y) => ({ dx: y, dy: -x - 0.5 * y });
      const jacobian = computeJacobian(dampedOsc, 0, 0);
      const res = classifyFixedPoint(jacobian);

      expect(res.trace).toBeLessThan(0);
      expect(res.stability).toBe('Stable Spiral (Focus Sink)');
    });
  });

  describe('Pillar 2: Mathematical Phase Plane Invariants', () => {
    it('should preserve equilibrium point (dx/dt = 0, dy/dt = 0) under RK4 step', () => {
      const system: ODESystemFn = (x, y) => ({ dx: -x, dy: -y });
      const next = rk4Step(system, 0, 0, 0.1);
      expect(next.x).toBe(0);
      expect(next.y).toBe(0);
    });
  });
});
