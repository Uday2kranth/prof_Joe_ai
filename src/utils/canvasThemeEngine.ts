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
  | 'oled_black'
  | 'tokyo_synthwave'
  | 'emerald_matrix'
  | 'solar_amber'
  | 'nordic_aurora'
  | 'chalkboard_slate'
  | 'royal_nebula'
  | 'sakura_blossom';

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
  tokyo_synthwave: {
    name: 'tokyo_synthwave',
    bg: '#0d0b1a',
    grid: 'rgba(236, 72, 153, 0.22)',
    axis: 'rgba(168, 85, 247, 0.7)',
    cardBg: 'rgba(22, 16, 43, 0.92)',
    cardBorder: 'rgba(236, 72, 153, 0.5)',
    plotBoxBg: 'rgba(18, 12, 34, 0.85)',
    plotBoxBorder: 'rgba(236, 72, 153, 0.6)',
    textPrimary: '#fdf2f8',
    textMuted: '#f472b6',
    accentCyan: '#38bdf8',
    accentAmber: '#facc15',
    accentEmerald: '#34d399',
    accentPurple: '#c084fc',
    accentRose: '#f43f5e',
  },
  emerald_matrix: {
    name: 'emerald_matrix',
    bg: '#021a12',
    grid: 'rgba(16, 185, 129, 0.22)',
    axis: 'rgba(52, 211, 153, 0.7)',
    cardBg: 'rgba(4, 38, 26, 0.92)',
    cardBorder: 'rgba(16, 185, 129, 0.55)',
    plotBoxBg: 'rgba(2, 28, 19, 0.85)',
    plotBoxBorder: 'rgba(16, 185, 129, 0.6)',
    textPrimary: '#ecfdf5',
    textMuted: '#6ee7b7',
    accentCyan: '#22d3ee',
    accentAmber: '#fde047',
    accentEmerald: '#10b981',
    accentPurple: '#a78bfa',
    accentRose: '#fb7185',
  },
  solar_amber: {
    name: 'solar_amber',
    bg: '#160c07',
    grid: 'rgba(245, 158, 11, 0.22)',
    axis: 'rgba(245, 158, 11, 0.7)',
    cardBg: 'rgba(34, 18, 10, 0.92)',
    cardBorder: 'rgba(245, 158, 11, 0.55)',
    plotBoxBg: 'rgba(26, 14, 8, 0.85)',
    plotBoxBorder: 'rgba(245, 158, 11, 0.6)',
    textPrimary: '#fffbeb',
    textMuted: '#fcd34d',
    accentCyan: '#38bdf8',
    accentAmber: '#f59e0b',
    accentEmerald: '#10b981',
    accentPurple: '#c084fc',
    accentRose: '#ea580c',
  },
  nordic_aurora: {
    name: 'nordic_aurora',
    bg: '#04161f',
    grid: 'rgba(45, 212, 191, 0.22)',
    axis: 'rgba(6, 182, 212, 0.7)',
    cardBg: 'rgba(6, 32, 44, 0.92)',
    cardBorder: 'rgba(45, 212, 191, 0.55)',
    plotBoxBg: 'rgba(4, 24, 34, 0.85)',
    plotBoxBorder: 'rgba(45, 212, 191, 0.6)',
    textPrimary: '#f0fdfa',
    textMuted: '#5eead4',
    accentCyan: '#2dd4bf',
    accentAmber: '#fde047',
    accentEmerald: '#34d399',
    accentPurple: '#a78bfa',
    accentRose: '#f43f5e',
  },
  chalkboard_slate: {
    name: 'chalkboard_slate',
    bg: '#161e1b',
    grid: 'rgba(254, 240, 138, 0.18)',
    axis: 'rgba(226, 232, 240, 0.65)',
    cardBg: 'rgba(28, 38, 34, 0.92)',
    cardBorder: 'rgba(148, 163, 184, 0.45)',
    plotBoxBg: 'rgba(20, 28, 25, 0.85)',
    plotBoxBorder: 'rgba(148, 163, 184, 0.55)',
    textPrimary: '#f8fafc',
    textMuted: '#cbd5e1',
    accentCyan: '#67e8f9',
    accentAmber: '#fef08a',
    accentEmerald: '#86efac',
    accentPurple: '#d8b4fe',
    accentRose: '#f472b6',
  },
  royal_nebula: {
    name: 'royal_nebula',
    bg: '#0d0720',
    grid: 'rgba(139, 92, 246, 0.24)',
    axis: 'rgba(168, 85, 247, 0.7)',
    cardBg: 'rgba(22, 12, 50, 0.92)',
    cardBorder: 'rgba(139, 92, 246, 0.55)',
    plotBoxBg: 'rgba(16, 9, 38, 0.85)',
    plotBoxBorder: 'rgba(139, 92, 246, 0.6)',
    textPrimary: '#faf5ff',
    textMuted: '#c084fc',
    accentCyan: '#38bdf8',
    accentAmber: '#facc15',
    accentEmerald: '#34d399',
    accentPurple: '#8b5cf6',
    accentRose: '#f43f5e',
  },
  sakura_blossom: {
    name: 'sakura_blossom',
    bg: '#150814',
    grid: 'rgba(244, 114, 182, 0.22)',
    axis: 'rgba(236, 72, 153, 0.7)',
    cardBg: 'rgba(32, 14, 30, 0.92)',
    cardBorder: 'rgba(244, 114, 182, 0.5)',
    plotBoxBg: 'rgba(24, 10, 22, 0.85)',
    plotBoxBorder: 'rgba(244, 114, 182, 0.58)',
    textPrimary: '#fdf2f8',
    textMuted: '#f472b6',
    accentCyan: '#38bdf8',
    accentAmber: '#fbbf24',
    accentEmerald: '#34d399',
    accentPurple: '#e879f9',
    accentRose: '#ec4899',
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
