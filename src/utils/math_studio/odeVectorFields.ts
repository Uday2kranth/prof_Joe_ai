/**
 * Ordinary Differential Equations (ODE) & Vector Fields Engine
 * Implements 4th-Order Runge-Kutta (RK4) integration, Vector Field evaluation,
 * and 2D Phase Portrait Jacobian Stability Classification (Node, Spiral, Saddle, Center).
 */

export interface SystemDerivatives {
  dx: number;
  dy: number;
}

export type ODESystemFn = (x: number, y: number) => SystemDerivatives;

export type StabilityType =
  | 'Stable Node (Sink)'
  | 'Unstable Node (Source)'
  | 'Stable Spiral (Focus Sink)'
  | 'Unstable Spiral (Focus Source)'
  | 'Saddle Point'
  | 'Center (Neutral Orbit)'
  | 'Degenerate / Line of Equilibria';

/**
 * 4th Order Runge-Kutta (RK4) Integrator Step for 2D System: dx/dt = f(x, y), dy/dt = g(x, y)
 */
export function rk4Step(
  system: ODESystemFn,
  x: number,
  y: number,
  dt: number
): { x: number; y: number } {
  const k1 = system(x, y);

  const xK2 = x + 0.5 * dt * k1.dx;
  const yK2 = y + 0.5 * dt * k1.dy;
  const k2 = system(xK2, yK2);

  const xK3 = x + 0.5 * dt * k2.dx;
  const yK3 = y + 0.5 * dt * k2.dy;
  const k3 = system(xK3, yK3);

  const xK4 = x + dt * k3.dx;
  const yK4 = y + dt * k3.dy;
  const k4 = system(xK4, yK4);

  const nextX = x + (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
  const nextY = y + (dt / 6) * (k1.dy + 2 * k2.dy + 2 * k3.dy + k4.dy);

  return { x: nextX, y: nextY };
}

/**
 * Compute Numerical Jacobian Matrix at Equilibrium Point (x0, y0)
 * J = [[df/dx, df/dy], [dg/dx, dg/dy]]
 */
export function computeJacobian(
  system: ODESystemFn,
  x0: number,
  y0: number,
  h: number = 1e-4
): [[number, number], [number, number]] {
  const f0 = system(x0, y0);
  
  const fXPlus = system(x0 + h, y0);
  const fXMinus = system(x0 - h, y0);
  const df_dx = (fXPlus.dx - fXMinus.dx) / (2 * h);
  const dg_dx = (fXPlus.dy - fXMinus.dy) / (2 * h);

  const fYPlus = system(x0, y0 + h);
  const fYMinus = system(x0, y0 - h);
  const df_dy = (fYPlus.dx - fYMinus.dx) / (2 * h);
  const dg_dy = (fYPlus.dy - fYMinus.dy) / (2 * h);

  return [
    [df_dx, df_dy],
    [dg_dx, dg_dy]
  ];
}

/**
 * Classify Fixed Point Stability using Trace-Determinant Plane
 * delta = Tr(J)^2 - 4*det(J)
 */
export function classifyFixedPoint(jacobian: [[number, number], [number, number]]): {
  trace: number;
  determinant: number;
  discriminant: number;
  stability: StabilityType;
} {
  const a = jacobian[0][0];
  const b = jacobian[0][1];
  const c = jacobian[1][0];
  const d = jacobian[1][1];

  const trace = a + d;
  const determinant = a * d - b * c;
  const discriminant = trace * trace - 4 * determinant;

  let stability: StabilityType = 'Degenerate / Line of Equilibria';

  if (determinant < -1e-6) {
    stability = 'Saddle Point';
  } else if (Math.abs(determinant) < 1e-6) {
    stability = 'Degenerate / Line of Equilibria';
  } else if (Math.abs(trace) < 1e-6) {
    stability = 'Center (Neutral Orbit)';
  } else if (discriminant < -1e-6) {
    stability = trace < 0 ? 'Stable Spiral (Focus Sink)' : 'Unstable Spiral (Focus Source)';
  } else {
    stability = trace < 0 ? 'Stable Node (Sink)' : 'Unstable Node (Source)';
  }

  return { trace, determinant, discriminant, stability };
}
