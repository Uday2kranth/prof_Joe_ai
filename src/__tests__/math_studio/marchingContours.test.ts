import { describe, it, expect } from 'vitest';
import {
  interpolateEdge,
  generateIsoSegments,
  segmentsToSvgPath
} from '../../utils/math_studio/marchingContours';

describe('Sub-Pixel Marching Iso-Contours Engine', () => {
  describe('Pillar 1: Textbook Mathematical Oracles', () => {
    it('should linearly interpolate midpoint when zero-crossing is symmetric (-2 to +2)', () => {
      const mid = interpolateEdge(-2, 2, 0, 10, 0);
      expect(mid).toBeCloseTo(5.0, 6);
    });

    it('should linearly interpolate 25% point when level is 0 for values (-1, 3)', () => {
      // t = (0 - (-1)) / (3 - (-1)) = 1 / 4 = 0.25
      const crossing = interpolateEdge(-1, 3, 0, 10, 0);
      expect(crossing).toBeCloseTo(2.5, 6);
    });
  });

  describe('Pillar 2: Geometric & Boundary Invariants', () => {
    it('should generate circular contour segments for circle field f(x, y) = x^2 + y^2 - 4 = 0', () => {
      const circleField = (x: number, y: number) => x * x + y * y - 4;
      const segments = generateIsoSegments(circleField, -3, 3, -3, 3, 30, 0);

      expect(segments.length).toBeGreaterThan(10);

      // Invariant: every point on every segment should satisfy x^2 + y^2 ~= 4 (radius 2)
      for (const seg of segments) {
        const r1 = Math.hypot(seg.p1.x, seg.p1.y);
        const r2 = Math.hypot(seg.p2.x, seg.p2.y);
        expect(r1).toBeCloseTo(2.0, 1);
        expect(r2).toBeCloseTo(2.0, 1);
      }
    });

    it('should produce valid non-empty SVG path string from segments', () => {
      const field = (x: number, y: number) => x + y;
      const segments = generateIsoSegments(field, -2, 2, -2, 2, 10, 0);
      const svgPath = segmentsToSvgPath(segments, x => x * 50 + 100, y => y * 50 + 100);

      expect(svgPath).toContain('M ');
      expect(svgPath).toContain('L ');
    });
  });

  describe('Pillar 3: Boundary & Uniform Field Cases', () => {
    it('should generate 0 segments when field is strictly positive or strictly negative everywhere', () => {
      const uniformPositiveField = () => 10.0;
      const segments = generateIsoSegments(uniformPositiveField, -2, 2, -2, 2, 10, 0);
      expect(segments.length).toBe(0);
    });
  });
});
