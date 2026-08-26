/**
 * Sub-Pixel Marching Iso-Contours Engine
 * Generates continuous SVG path strings from 2D scalar fields f(x, y) = level using linear edge interpolation.
 */

export interface ContourPoint {
  x: number;
  y: number;
}

export interface ContourSegment {
  p1: ContourPoint;
  p2: ContourPoint;
}

/**
 * Linear interpolation of zero-crossing along grid edge
 */
export function interpolateEdge(
  val1: number,
  val2: number,
  coord1: number,
  coord2: number,
  level: number = 0
): number {
  const diff = val2 - val1;
  if (Math.abs(diff) < 1e-9) return (coord1 + coord2) / 2;
  const t = (level - val1) / diff;
  return coord1 + t * (coord2 - coord1);
}

/**
 * Generate contour line segments for a scalar field f(x, y) at a given iso-level
 */
export function generateIsoSegments(
  fieldFn: (x: number, y: number) => number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  gridSteps: number = 40,
  level: number = 0
): ContourSegment[] {
  const segments: ContourSegment[] = [];
  const dx = (xMax - xMin) / gridSteps;
  const dy = (yMax - yMin) / gridSteps;

  // Precompute grid values
  const grid: number[][] = [];
  for (let i = 0; i <= gridSteps; i++) {
    grid[i] = [];
    const gx = xMin + i * dx;
    for (let j = 0; j <= gridSteps; j++) {
      const gy = yMin + j * dy;
      grid[i][j] = fieldFn(gx, gy);
    }
  }

  // March through grid cells
  for (let i = 0; i < gridSteps; i++) {
    const x0 = xMin + i * dx;
    const x1 = x0 + dx;

    for (let j = 0; j < gridSteps; j++) {
      const y0 = yMin + j * dy;
      const y1 = y0 + dy;

      const vTL = grid[i][j + 1];     // Top-Left (x0, y1)
      const vTR = grid[i + 1][j + 1]; // Top-Right (x1, y1)
      const vBR = grid[i + 1][j];     // Bottom-Right (x1, y0)
      const vBL = grid[i][j];         // Bottom-Left (x0, y0)

      // 4-bit cell index
      let cellCase = 0;
      if (vBL >= level) cellCase |= 1;
      if (vBR >= level) cellCase |= 2;
      if (vTR >= level) cellCase |= 4;
      if (vTL >= level) cellCase |= 8;

      if (cellCase === 0 || cellCase === 15) continue; // Completely above or below

      // Edge crossing points: Bottom, Right, Top, Left
      const ptBottom = { x: interpolateEdge(vBL, vBR, x0, x1, level), y: y0 };
      const ptRight = { x: x1, y: interpolateEdge(vBR, vTR, y0, y1, level) };
      const ptTop = { x: interpolateEdge(vTL, vTR, x0, x1, level), y: y1 };
      const ptLeft = { x: x0, y: interpolateEdge(vBL, vTL, y0, y1, level) };

      switch (cellCase) {
        case 1:  // BL
        case 14:
          segments.push({ p1: ptLeft, p2: ptBottom });
          break;
        case 2:  // BR
        case 13:
          segments.push({ p1: ptBottom, p2: ptRight });
          break;
        case 3:  // BL + BR (Bottom half)
        case 12:
          segments.push({ p1: ptLeft, p2: ptRight });
          break;
        case 4:  // TR
        case 11:
          segments.push({ p1: ptRight, p2: ptTop });
          break;
        case 5:  // BL + TR (Saddle / Ambiguous)
        case 10:
          segments.push({ p1: ptLeft, p2: ptTop });
          segments.push({ p1: ptBottom, p2: ptRight });
          break;
        case 6:  // BR + TR (Right half)
        case 9:
          segments.push({ p1: ptBottom, p2: ptTop });
          break;
        case 7:  // BL + BR + TR
        case 8:
          segments.push({ p1: ptLeft, p2: ptTop });
          break;
      }
    }
  }

  return segments;
}

/**
 * Convert contour segments to SVG path 'd' string with coordinate scaling
 */
export function segmentsToSvgPath(
  segments: ContourSegment[],
  toSvgX: (x: number) => number,
  toSvgY: (y: number) => number
): string {
  let path = '';
  for (const seg of segments) {
    const sx1 = toSvgX(seg.p1.x);
    const sy1 = toSvgY(seg.p1.y);
    const sx2 = toSvgX(seg.p2.x);
    const sy2 = toSvgY(seg.p2.y);
    path += `M ${sx1.toFixed(1)} ${sy1.toFixed(1)} L ${sx2.toFixed(1)} ${sy2.toFixed(1)} `;
  }
  return path.trim();
}
