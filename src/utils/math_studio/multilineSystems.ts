/**
 * Multi-Line Systems & Linear Programming Geometry Engine
 * Solves 2x2 Matrix Systems (Cramer's Rule), Line Intersections, and Feasible Polygons.
 */

export interface LineEquation {
  id: string | number;
  a: number; // a*x + b*y = c
  b: number;
  c: number;
  label?: string;
  inequality?: '<=' | '>=' | '=';
}

export interface IntersectionResult {
  x: number;
  y: number;
  det: number;
  isParallel: boolean;
}

/**
 * Compute 2x2 Matrix Determinant: det([[a, b], [c, d]]) = a*d - b*c
 */
export function compute2x2Determinant(a: number, b: number, c: number, d: number): number {
  return a * d - b * c;
}

/**
 * Compute intersection point of two 2D lines: a1*x + b1*y = c1 and a2*x + b2*y = c2
 * Using Cramer's Rule
 */
export function intersectLines(l1: LineEquation, l2: LineEquation): IntersectionResult {
  const det = compute2x2Determinant(l1.a, l1.b, l2.a, l2.b);


  if (Math.abs(det) < 1e-9) {
    return { x: 0, y: 0, det: 0, isParallel: true };
  }

  // Cramer's rule:
  // x = (c1*b2 - c2*b1) / det
  // y = (a1*c2 - a2*c1) / det
  const x = (l1.c * l2.b - l2.c * l1.b) / det;
  const y = (l1.a * l2.c - l2.a * l1.c) / det;

  return { x, y, det, isParallel: false };
}

/**
 * Check if a candidate point (x, y) satisfies a set of half-plane linear constraints
 */
export function isPointFeasible(
  x: number,
  y: number,
  constraints: LineEquation[],
  tolerance: number = 1e-5
): boolean {
  for (const line of constraints) {
    const val = line.a * x + line.b * y;
    if (line.inequality === '<=' && val > line.c + tolerance) return false;
    if (line.inequality === '>=' && val < line.c - tolerance) return false;
  }
  return true;
}

/**
 * Find all feasible vertices of a system of linear inequality constraints
 */
export function findFeasibleVertices(constraints: LineEquation[]): Array<{ x: number; y: number }> {
  const vertices: Array<{ x: number; y: number }> = [];
  const n = constraints.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const inter = intersectLines(constraints[i], constraints[j]);
      if (!inter.isParallel) {
        if (isPointFeasible(inter.x, inter.y, constraints)) {
          // Avoid duplicate vertices
          const isDuplicate = vertices.some(v => Math.hypot(v.x - inter.x, v.y - inter.y) < 1e-4);
          if (!isDuplicate) {
            vertices.push({ x: inter.x, y: inter.y });
          }
        }
      }
    }
  }

  return vertices;
}
