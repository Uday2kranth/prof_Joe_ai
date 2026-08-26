/**
 * Tangents, Derivatives & Riemann Integration Mathematical Engine
 * Implements numerical differentiation (Central Difference) and Riemann Sums (Left, Right, Midpoint, Trapezoid, Simpson's Rule).
 */

export type RiemannRule = 'left' | 'right' | 'midpoint' | 'trapezoid' | 'simpson';

/**
 * Numerical First Derivative using symmetric central difference
 * f'(x) = (f(x + h) - f(x - h)) / (2 * h)
 */
export function numericalDerivative(fn: (x: number) => number, x: number, h: number = 1e-5): number {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

/**
 * Numerical Second Derivative (Concavity)
 * f''(x) = (f(x + h) - 2*f(x) + f(x - h)) / (h^2)
 */
export function numericalSecondDerivative(fn: (x: number) => number, x: number, h: number = 1e-4): number {
  return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h);
}

/**
 * Riemann Sum Integration
 */
export function computeRiemannSum(
  fn: (x: number) => number,
  a: number,
  b: number,
  n: number,
  rule: RiemannRule
): number {
  if (n <= 0 || a === b) return 0;
  const dx = (b - a) / n;

  if (rule === 'left') {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += fn(a + i * dx);
    }
    return sum * dx;
  }

  if (rule === 'right') {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      sum += fn(a + i * dx);
    }
    return sum * dx;
  }

  if (rule === 'midpoint') {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += fn(a + (i + 0.5) * dx);
    }
    return sum * dx;
  }

  if (rule === 'trapezoid') {
    let sum = 0.5 * (fn(a) + fn(b));
    for (let i = 1; i < n; i++) {
      sum += fn(a + i * dx);
    }
    return sum * dx;
  }

  if (rule === 'simpson') {
    // Requires even number of intervals
    const intervals = n % 2 === 0 ? n : n + 1;
    const simpsonDx = (b - a) / intervals;
    let sum = fn(a) + fn(b);
    for (let i = 1; i < intervals; i++) {
      const coeff = i % 2 === 1 ? 4 : 2;
      sum += coeff * fn(a + i * simpsonDx);
    }
    return (sum * simpsonDx) / 3;
  }

  return 0;
}
