/**
 * ═════════════════════════════════════════════════════════════════════════════
 * 🏛️ PROF. JOE AI — UNIFIED CANVAS VISUALIZATION & THEME ENGINE
 * ═════════════════════════════════════════════════════════════════════════════
 * Single Source of Truth for 2D/3D Canvas Rendering, Theme Palettes,
 * Card Surface Layouts, and Boundary Clipping across all Sandbox Modules.
 */

export type CanvasAtmosphere =
  | 'deep_void'
  | 'blueprint_matrix'
  | 'academic_parchment'
  | 'oxford_daylight'
  | 'oled_black';

export interface CanvasThemeTokens {
  name: CanvasAtmosphere;
  bg: string;              // Canvas outer background
  grid: string;            // Coordinate grid line stroke
  axis: string;            // Coordinate main axis stroke
  cardBg: string;          // Diagram sub-card surface fill
  cardBorder: string;      // Diagram sub-card border stroke
  plotBoxBg: string;       // Inner graph plotting box fill
  plotBoxBorder: string;   // Inner graph plotting box border stroke
  textPrimary: string;     // Primary high-contrast labels & math titles
  textMuted: string;       // Secondary labels, hints & tick labels
  // Harmonious Palette
  accentCyan: string;
  accentAmber: string;
  accentEmerald: string;
  accentPurple: string;
  accentRose: string;
}

const THEME_PALETTES: Record<CanvasAtmosphere, CanvasThemeTokens> = {
  deep_void: {
    name: 'deep_void',
    bg: '#020617',
    grid: 'rgba(56, 189, 248, 0.16)',
    axis: 'rgba(100, 116, 139, 0.65)',
    cardBg: 'rgba(11, 15, 25, 0.88)',
    cardBorder: 'rgba(51, 65, 85, 0.75)',
    plotBoxBg: 'rgba(15, 23, 42, 0.75)',
    plotBoxBorder: 'rgba(51, 65, 85, 0.8)',
    textPrimary: '#f8fafc',
    textMuted: '#94a3b8',
    accentCyan: '#38bdf8',
    accentAmber: '#fbbf24',
    accentEmerald: '#34d399',
    accentPurple: '#c084fc',
    accentRose: '#f43f5e',
  },
  blueprint_matrix: {
    name: 'blueprint_matrix',
    bg: '#071927',
    grid: 'rgba(6, 182, 212, 0.22)',
    axis: 'rgba(6, 182, 212, 0.7)',
    cardBg: 'rgba(12, 35, 54, 0.9)',
    cardBorder: 'rgba(6, 182, 212, 0.55)',
    plotBoxBg: 'rgba(8, 30, 48, 0.82)',
    plotBoxBorder: 'rgba(6, 182, 212, 0.6)',
    textPrimary: '#e0f2fe',
    textMuted: '#7dd3fc',
    accentCyan: '#38bdf8',
    accentAmber: '#fde047',
    accentEmerald: '#2dd4bf',
    accentPurple: '#a78bfa',
    accentRose: '#fb7185',
  },
  academic_parchment: {
    name: 'academic_parchment',
    bg: '#fdfaf3',
    grid: 'rgba(217, 119, 6, 0.16)',
    axis: 'rgba(120, 53, 15, 0.55)',
    cardBg: 'rgba(244, 239, 230, 0.94)',
    cardBorder: 'rgba(217, 119, 6, 0.38)',
    plotBoxBg: 'rgba(238, 231, 220, 0.85)',
    plotBoxBorder: 'rgba(180, 83, 9, 0.45)',
    textPrimary: '#1c1917',
    textMuted: '#78350f',
    accentCyan: '#0284c7',
    accentAmber: '#d97706',
    accentEmerald: '#059669',
    accentPurple: '#7c3aed',
    accentRose: '#e11d48',
  },
  oxford_daylight: {
    name: 'oxford_daylight',
    bg: '#ffffff',
    grid: 'rgba(148, 163, 184, 0.22)',
    axis: 'rgba(71, 85, 105, 0.65)',
    cardBg: 'rgba(248, 250, 252, 0.95)',
    cardBorder: 'rgba(203, 213, 225, 0.85)',
    plotBoxBg: 'rgba(241, 245, 249, 0.92)',
    plotBoxBorder: 'rgba(148, 163, 184, 0.7)',
    textPrimary: '#0f172a',
    textMuted: '#475569',
    accentCyan: '#0284c7',
    accentAmber: '#d97706',
    accentEmerald: '#16a34a',
    purple: '#9333ea',
    accentPurple: '#9333ea',
    accentRose: '#e11d48',
  },
  oled_black: {
    name: 'oled_black',
    bg: '#000000',
    grid: 'rgba(38, 38, 38, 0.45)',
    axis: 'rgba(56, 189, 248, 0.55)',
    cardBg: 'rgba(10, 10, 10, 0.95)',
    cardBorder: 'rgba(45, 45, 45, 0.9)',
    plotBoxBg: 'rgba(18, 18, 18, 0.85)',
    plotBoxBorder: 'rgba(40, 40, 40, 0.85)',
    textPrimary: '#ffffff',
    textMuted: '#a3a3a3',
    accentCyan: '#38bdf8',
    accentAmber: '#fbbf24',
    accentEmerald: '#34d399',
    accentPurple: '#c084fc',
    accentRose: '#f43f5e',
  },
};

/**
 * Returns the full typed color tokens for any CanvasAtmosphere.
 * Falls back safely to 'deep_void'.
 */
export function getCanvasTheme(atmosphere?: string | null): CanvasThemeTokens {
  const atmoKey = (atmosphere || 'deep_void') as CanvasAtmosphere;
  return THEME_PALETTES[atmoKey] || THEME_PALETTES.deep_void;
}

/**
 * Fills the canvas with the background atmosphere color and draws standard grid lines.
 */
export function drawCanvasAtmosphere(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: CanvasThemeTokens,
  gridStep = 40
): void {
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = theme.grid;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += gridStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += gridStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

/**
 * Renders a consistent diagram card container with title, rounded borders, and themed fill.
 */
export function drawDiagramCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: CanvasThemeTokens,
  title?: string,
  borderRadius = 10
): void {
  ctx.fillStyle = theme.cardBg;
  ctx.strokeStyle = theme.cardBorder;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.fill();
  ctx.stroke();

  if (title) {
    ctx.fillStyle = theme.accentCyan;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(title, x + 14, y + 22);
  }
}

/**
 * Safely wraps canvas draw instructions with a rectangular clipping mask.
 * Guarantees that rays, vectors, curves, and data points NEVER bleed outside their container.
 */
export function withPlotBoxClip(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  borderRadius = 8,
  drawFn: () => void
): void {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, borderRadius);
  ctx.clip();
  try {
    drawFn();
  } finally {
    ctx.restore();
  }
}
