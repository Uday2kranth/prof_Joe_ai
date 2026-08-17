// Pure Client-Side Mathematical 2D Function Plotter & Statistical Distribution Renderer
// Generates high-density, vector-crisp SVGs for math functions, probability curves, rejection regions, and scatter plots.

export interface FunctionPlotPoint {
  x: number;
  y: number;
  label?: string;
  class?: string;
  color?: string;
}

export interface FunctionPlotCurve {
  fn: string;
  color?: string;
  label?: string;
  dashed?: boolean;
}

export interface RejectionRegion {
  critical?: number;
  criticalValues?: [number, number];
  tail?: 'both' | 'right' | 'left';
  type?: 'two-tailed' | 'right' | 'left' | 'lower' | 'upper';
  alpha?: number;
  label?: string;
}

export interface FunctionPlotRegion {
  domain: [number, number];
  color?: string;
  label?: string;
}

export interface FunctionPlotTangent {
  x: number;
  slope: number;
  color?: string;
}

export interface FunctionPlotSpec {
  title?: string;
  fn?: string;
  functions?: FunctionPlotCurve[];
  domain?: [number, number];
  yDomain?: [number, number];
  xLabel?: string;
  yLabel?: string;
  points?: FunctionPlotPoint[];
  regions?: FunctionPlotRegion[];
  tangents?: FunctionPlotTangent[];
  rejection?: RejectionRegion;
  grid?: boolean;
}

/**
 * Lanczos Gamma approximation for fractional and integer inputs
 */
function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  const g = 7;
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.138571095836524, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  let x = c[0];
  for (let i = 1; i < g + 2; i++) x += c[i] / (z + i);
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

/**
 * Student's t-distribution probability density function
 */
function studentTPdf(x: number, df: number): number {
  if (df <= 0) return 0;
  const numerator = gamma((df + 1) / 2);
  const denominator = Math.sqrt(Math.PI * df) * gamma(df / 2);
  return (numerator / denominator) * Math.pow(1 + (x * x) / df, -(df + 1) / 2);
}

/**
 * Chi-Square probability density function
 */
function chiSquarePdf(x: number, k: number): number {
  if (x <= 0 || k <= 0) return 0;
  const coeff = 1 / (Math.pow(2, k / 2) * gamma(k / 2));
  return coeff * Math.pow(x, k / 2 - 1) * Math.exp(-x / 2);
}

/**
 * Safely evaluates a mathematical expression string for a given x value
 */
export function evaluateMathFunction(fnStr: string, x: number): number {
  if (!fnStr || typeof fnStr !== 'string') return 0;

  try {
    // 1. Handle specialized statistical function shortcuts
    const tMatch = fnStr.match(/^t_dist\(\s*(?:x\s*,\s*)?(\d+)\s*\)$/i);
    if (tMatch) {
      return studentTPdf(x, parseFloat(tMatch[1]));
    }
    const chiMatch = fnStr.match(/^chi2_dist\(\s*(?:x\s*,\s*)?(\d+)\s*\)$/i);
    if (chiMatch) {
      return chiSquarePdf(x, parseFloat(chiMatch[1]));
    }

    // 2. Sanitize and replace math symbols, functions, and constants
    let expr = fnStr
      .replace(/\bPI\b/gi, `${Math.PI}`)
      .replace(/\bE\b/g, `${Math.E}`)
      .replace(/\bsqrt\b/gi, 'Math.sqrt')
      .replace(/\bexp\b/gi, 'Math.exp')
      .replace(/\bsin\b/gi, 'Math.sin')
      .replace(/\bcos\b/gi, 'Math.cos')
      .replace(/\btan\b/gi, 'Math.tan')
      .replace(/\btanh\b/gi, 'Math.tanh')
      .replace(/\babs\b/gi, 'Math.abs')
      .replace(/\blog\b/gi, 'Math.log')
      .replace(/\bmax\b/gi, 'Math.max')
      .replace(/\bmin\b/gi, 'Math.min')
      .replace(/\bpow\b/gi, 'Math.pow')
      .replace(/\bsigmoid\(([^)]+)\)/gi, '(1/(1+Math.exp(-($1))))')
      .replace(/\brelu\(([^)]+)\)/gi, 'Math.max(0,($1))')
      .replace(/\^/g, '**');

    // Replace variable x (ensuring not to replace within Math.*)
    expr = expr.replace(/\b(x)\b/g, `(${x})`);

    // Only allow safe math tokens
    const isSafe = /^[\d\s+\-*/%(),.Mathsqrtexpincostanblgpx]+$/.test(expr) || /^[\d\s+\-*/%(),.eE]+$/.test(expr);
    if (!isSafe) {
      return 0;
    }

    const result = Function(`"use strict"; return (${expr});`)();
    return typeof result === 'number' && !isNaN(result) && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

/**
 * Parses raw code block text (JSON or key-value) into a structured FunctionPlotSpec
 */
export function parseFunctionPlotSource(source: string): FunctionPlotSpec {
  const clean = source.trim();

  // 1. Try standard JSON parsing
  if (clean.startsWith('{') && clean.endsWith('}')) {
    try {
      return JSON.parse(clean);
    } catch {
      // Attempt relaxed JSON (unquoted keys or single quotes)
      try {
        const jsonish = clean
          .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
          .replace(/'/g, '"');
        return JSON.parse(jsonish);
      } catch {
        // Fall back to key-value extraction below
      }
    }
  }

  // 2. Line-by-line / key-value fallback
  const spec: FunctionPlotSpec = {
    domain: [-4, 4],
    grid: true
  };

  const lines = clean.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) continue;

    if (/^title\s*[:=]\s*(.+)/i.test(trimmed)) {
      spec.title = trimmed.replace(/^title\s*[:=]\s*/i, '').replace(/["']/g, '').trim();
    } else if (/^fn\s*[:=]\s*(.+)/i.test(trimmed)) {
      spec.fn = trimmed.replace(/^fn\s*[:=]\s*/i, '').replace(/["']/g, '').trim();
    } else if (/^domain\s*[:=]\s*\[([^\]]+)\]/i.test(trimmed)) {
      const match = trimmed.match(/\[([^,]+),([^\]]+)\]/);
      if (match) {
        spec.domain = [parseFloat(match[1]), parseFloat(match[2])];
      }
    } else if (/^xLabel\s*[:=]\s*(.+)/i.test(trimmed)) {
      spec.xLabel = trimmed.replace(/^xLabel\s*[:=]\s*/i, '').replace(/["']/g, '').trim();
    } else if (/^yLabel\s*[:=]\s*(.+)/i.test(trimmed)) {
      spec.yLabel = trimmed.replace(/^yLabel\s*[:=]\s*/i, '').replace(/["']/g, '').trim();
    }
  }

  if (!spec.fn && (!spec.functions || spec.functions.length === 0)) {
    spec.fn = clean;
  }

  return spec;
}

/**
 * Generates an ultra-crisp, high-contrast standalone SVG for 2D Math Function Plots
 */
export function renderFunctionPlotSvg(spec: FunctionPlotSpec): string {
  const width = 640;
  const height = 400;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 72;
  const padBottom = 55;

  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const xMin = spec.domain ? spec.domain[0] : -4;
  const xMax = spec.domain ? spec.domain[1] : 4;
  const xRange = xMax - xMin || 1;

  // Prepare list of curves to render
  const curves: FunctionPlotCurve[] = [];
  if (spec.fn) {
    curves.push({ fn: spec.fn, color: '#38bdf8', label: spec.title || 'f(x)' });
  }
  if (spec.functions && Array.isArray(spec.functions)) {
    const defaultColors = ['#38bdf8', '#10b981', '#f43f5e', '#fbbf24', '#a855f7', '#06b6d4'];
    spec.functions.forEach((f, idx) => {
      curves.push({
        fn: f.fn,
        color: f.color || defaultColors[idx % defaultColors.length],
        label: f.label || `f${idx + 1}(x)`,
        dashed: f.dashed
      });
    });
  }

  // Sample points across x range to determine auto yDomain if not specified
  const numSamples = 160;
  const sampleData: Array<{ x: number; yValues: number[] }> = [];
  let computedYMin = Infinity;
  let computedYMax = -Infinity;

  for (let i = 0; i <= numSamples; i++) {
    const xVal = xMin + (i / numSamples) * xRange;
    const yVals: number[] = [];
    curves.forEach(curve => {
      const yVal = evaluateMathFunction(curve.fn, xVal);
      yVals.push(yVal);
      if (!isNaN(yVal) && isFinite(yVal)) {
        if (yVal < computedYMin) computedYMin = yVal;
        if (yVal > computedYMax) computedYMax = yVal;
      }
    });
    sampleData.push({ x: xVal, yValues: yVals });
  }

  if (spec.points && spec.points.length > 0) {
    spec.points.forEach(pt => {
      if (pt.y < computedYMin) computedYMin = pt.y;
      if (pt.y > computedYMax) computedYMax = pt.y;
    });
  }

  if (!isFinite(computedYMin) || computedYMin === Infinity) computedYMin = -1;
  if (!isFinite(computedYMax) || computedYMax === -Infinity) computedYMax = 1;

  // Add 10% padding to Y range
  const ySpan = computedYMax - computedYMin || 1;
  const yMin = spec.yDomain ? spec.yDomain[0] : Math.floor((computedYMin - ySpan * 0.1) * 10) / 10;
  const yMax = spec.yDomain ? spec.yDomain[1] : Math.ceil((computedYMax + ySpan * 0.1) * 10) / 10;
  const yRange = yMax - yMin || 1;

  // Coordinate mapping functions
  const mapX = (x: number) => padLeft + ((x - xMin) / xRange) * plotWidth;
  const mapY = (y: number) => padTop + plotHeight - ((y - yMin) / yRange) * plotHeight;

  // SVG Elements Accumulator
  const svgParts: string[] = [];

  // 1. Background, Glow filter and ClipPath definitions
  svgParts.push(`
    <defs>
      <linearGradient id="plotBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <clipPath id="plotClip">
        <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" rx="4" />
      </clipPath>
    </defs>
    <rect width="${width}" height="${height}" rx="14" fill="url(#plotBg)" stroke="#1e293b" stroke-width="1.5" />
    <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" rx="4" fill="#020617" fill-opacity="0.8" stroke="#334155" stroke-width="1.2" />
  `);

  // 2. Subtle Grid Lines & X/Y Ticks
  const numXTicks = 6;
  for (let i = 0; i <= numXTicks; i++) {
    const xVal = xMin + (i / numXTicks) * xRange;
    const px = mapX(xVal);
    svgParts.push(`
      <line x1="${px}" y1="${padTop}" x2="${px}" y2="${padTop + plotHeight}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${px}" y="${padTop + plotHeight + 16}" fill="#94a3b8" font-size="10" font-family="'Inter', system-ui, sans-serif" font-weight="500" text-anchor="middle">${Math.round(xVal * 10) / 10}</text>
    `);
  }

  const numYTicks = 5;
  for (let i = 0; i <= numYTicks; i++) {
    const yVal = yMin + (i / numYTicks) * yRange;
    const py = mapY(yVal);
    svgParts.push(`
      <line x1="${padLeft}" y1="${py}" x2="${padLeft + plotWidth}" y2="${py}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${padLeft - 10}" y="${py + 3}" fill="#94a3b8" font-size="10" font-family="'Inter', system-ui, sans-serif" font-weight="500" text-anchor="end">${Math.round(yVal * 100) / 100}</text>
    `);
  }

  // 3. Zero Axes (if visible within domain)
  if (xMin <= 0 && xMax >= 0) {
    const zeroX = mapX(0);
    svgParts.push(`
      <line x1="${zeroX}" y1="${padTop}" x2="${zeroX}" y2="${padTop + plotHeight}" stroke="#475569" stroke-width="1.5" />
    `);
  }
  if (yMin <= 0 && yMax >= 0) {
    const zeroY = mapY(0);
    svgParts.push(`
      <line x1="${padLeft}" y1="${zeroY}" x2="${padLeft + plotWidth}" y2="${zeroY}" stroke="#475569" stroke-width="1.5" />
    `);
  }

  // 4. Shaded Rejection Regions (Statistical Hypothesis Testing)
  if (spec.rejection && curves.length > 0) {
    const primaryCurve = curves[0];
    const rejType = spec.rejection.type || 'two-tailed';
    const alpha = spec.rejection.alpha || 0.05;
    const critLeft = spec.rejection.criticalValues ? spec.rejection.criticalValues[0] : (rejType === 'two-tailed' ? -1.96 : (rejType === 'lower' ? -1.645 : null));
    const critRight = spec.rejection.criticalValues ? spec.rejection.criticalValues[1] : (rejType === 'two-tailed' ? 1.96 : (rejType === 'upper' ? 1.645 : null));

    // Left rejection region polygon
    if (critLeft !== null && critLeft > xMin) {
      let areaD = `M ${mapX(xMin)} ${mapY(0)} `;
      sampleData.filter(s => s.x <= critLeft).forEach(s => {
        areaD += `L ${mapX(s.x)} ${mapY(evaluateMathFunction(primaryCurve.fn, s.x))} `;
      });
      areaD += `L ${mapX(critLeft)} ${mapY(0)} Z`;
      svgParts.push(`
        <path d="${areaD}" fill="rgba(244, 63, 94, 0.28)" stroke="none" clip-path="url(#plotClip)" />
        <line x1="${mapX(critLeft)}" y1="${padTop}" x2="${mapX(critLeft)}" y2="${padTop + plotHeight}" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="${mapX(critLeft)}" y="${padTop + 16}" fill="#f43f5e" font-size="9.5" font-family="'Inter', system-ui, sans-serif" font-weight="700" text-anchor="middle">α/2 = ${(alpha / 2).toFixed(3)}</text>
      `);
    }

    // Right rejection region polygon
    if (critRight !== null && critRight < xMax) {
      let areaD = `M ${mapX(critRight)} ${mapY(0)} `;
      sampleData.filter(s => s.x >= critRight).forEach(s => {
        areaD += `L ${mapX(s.x)} ${mapY(evaluateMathFunction(primaryCurve.fn, s.x))} `;
      });
      areaD += `L ${mapX(xMax)} ${mapY(0)} Z`;
      svgParts.push(`
        <path d="${areaD}" fill="rgba(244, 63, 94, 0.28)" stroke="none" clip-path="url(#plotClip)" />
        <line x1="${mapX(critRight)}" y1="${padTop}" x2="${mapX(critRight)}" y2="${padTop + plotHeight}" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="${mapX(critRight)}" y="${padTop + 16}" fill="#f43f5e" font-size="9.5" font-family="'Inter', system-ui, sans-serif" font-weight="700" text-anchor="middle">α/2 = ${(alpha / 2).toFixed(3)}</text>
      `);
    }
  }

  // 5. Linear Decision Boundary / Shaded Regions (ML Classification)
  if (spec.regions && Array.isArray(spec.regions)) {
    spec.regions.forEach(reg => {
      const x0 = mapX(reg.domain ? reg.domain[0] : xMin);
      const x1 = mapX(reg.domain ? reg.domain[1] : xMax);
      const regColor = reg.color || 'rgba(56, 189, 248, 0.12)';
      svgParts.push(`
        <rect x="${Math.min(x0, x1)}" y="${padTop}" width="${Math.abs(x1 - x0)}" height="${plotHeight}" fill="${regColor}" clip-path="url(#plotClip)" />
      `);
    });
  }

  // 6. Tangent Slopes / Optimization Gradients
  if (spec.tangents && Array.isArray(spec.tangents)) {
    spec.tangents.forEach(t => {
      const atX = t.x;
      const atY = evaluateMathFunction(spec.fn || curves[0]?.fn || 'x', atX);
      const slope = t.slope;
      const tLen = 2.0;
      const x1 = atX - tLen;
      const y1 = atY - slope * tLen;
      const x2 = atX + tLen;
      const y2 = atY + slope * tLen;

      svgParts.push(`
        <line x1="${mapX(x1)}" y1="${mapY(y1)}" x2="${mapX(x2)}" y2="${mapY(y2)}" stroke="${t.color || '#fbbf24'}" stroke-width="2" stroke-dasharray="4,4" />
        <circle cx="${mapX(atX)}" cy="${mapY(atY)}" r="4.5" fill="${t.color || '#fbbf24'}" stroke="#ffffff" stroke-width="1.5" />
      `);
    });
  }

  // 7. Draw Continuous Mathematical Function Curves
  curves.forEach((curve, curveIdx) => {
    let pathD = '';
    sampleData.forEach((sample, idx) => {
      const px = mapX(sample.x);
      const py = mapY(sample.yValues[curveIdx]);
      if (idx === 0) {
        pathD += `M ${px.toFixed(1)} ${py.toFixed(1)} `;
      } else {
        pathD += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
      }
    });

    const dashAttr = curve.dashed ? 'stroke-dasharray="5,5"' : '';
    svgParts.push(`
      <path d="${pathD}" fill="none" stroke="${curve.color || '#38bdf8'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" ${dashAttr} filter="url(#glow)" />
    `);
  });

  // 8. Scatter Points / Decision Boundary Samples
  if (spec.points && Array.isArray(spec.points)) {
    spec.points.forEach(pt => {
      const px = mapX(pt.x);
      const py = mapY(pt.y);
      const ptColor = pt.color || (pt.class && (pt.class.includes('B') || pt.class.includes('-1')) ? '#f43f5e' : '#38bdf8');
      svgParts.push(`
        <circle cx="${px}" cy="${py}" r="5" fill="${ptColor}" stroke="#ffffff" stroke-width="1.5" filter="url(#glow)" />
        ${pt.label ? `<text x="${px + 8}" y="${py - 6}" fill="#f8fafc" font-size="10" font-family="'Inter', system-ui, sans-serif" font-weight="600">${pt.label}</text>` : ''}
      `);
    });
  }

  // 9. Row 1: Title Bar (y = 26)
  const plotTitle = spec.title || '2D Mathematical & Statistical Function Plot';
  svgParts.push(`
    <g transform="translate(20, 26)">
      <rect x="0" y="-14" width="115" height="22" rx="11" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.3)" />
      <text x="10" y="1" fill="#38bdf8" font-size="10.5" font-family="'Inter', system-ui, sans-serif" font-weight="700">📈 2D PLOT</text>
      <text x="125" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', system-ui, sans-serif" font-weight="600">${plotTitle}</text>
    </g>
  `);

  // 10. Row 2: Dedicated Multi-Curve & Rejection Legend Row (y = 52)
  let curX = 0;
  if (curves.length > 0) {
    curves.forEach((c) => {
      const labelText = c.label || c.fn;
      const pillWidth = labelText.length * 6.8 + 26;
      svgParts.push(`
        <g transform="translate(${padLeft + curX}, 52)">
          <rect x="-4" y="-12" width="${pillWidth}" height="17" rx="5" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.1)" />
          <line x1="2" y1="-4" x2="14" y2="-4" stroke="${c.color || '#38bdf8'}" stroke-width="2.5" ${c.dashed ? 'stroke-dasharray="3,3"' : ''} />
          <text x="18" y="0" fill="#cbd5e1" font-size="9.5" font-family="'Inter', system-ui, sans-serif" font-weight="600">${labelText}</text>
        </g>
      `);
      curX += pillWidth + 8;
    });
  }

  if (spec.rejection) {
    const rejText = spec.rejection.label || `Rejection Zone (α = ${spec.rejection.alpha || 0.05})`;
    const pillWidth = rejText.length * 6.8 + 24;
    svgParts.push(`
      <g transform="translate(${padLeft + curX}, 52)">
        <rect x="-4" y="-12" width="${pillWidth}" height="17" rx="5" fill="rgba(244, 63, 94, 0.15)" stroke="rgba(244, 63, 94, 0.3)" />
        <rect x="2" y="-9" width="9" height="9" rx="2" fill="rgba(244, 63, 94, 0.6)" stroke="#f43f5e" />
        <text x="16" y="0" fill="#f43f5e" font-size="9.5" font-family="'Inter', system-ui, sans-serif" font-weight="600">${rejText}</text>
      </g>
    `);
  }

  // 11. Axis Labels
  if (spec.xLabel) {
    svgParts.push(`
      <text x="${padLeft + plotWidth / 2}" y="${height - 12}" fill="#cbd5e1" font-size="11.5" font-family="'Inter', system-ui, sans-serif" font-weight="600" text-anchor="middle">${spec.xLabel}</text>
    `);
  }
  if (spec.yLabel) {
    svgParts.push(`
      <text x="18" y="${padTop + plotHeight / 2}" fill="#cbd5e1" font-size="11.5" font-family="'Inter', system-ui, sans-serif" font-weight="600" text-anchor="middle" transform="rotate(-90, 18, ${padTop + plotHeight / 2})">${spec.yLabel}</text>
    `);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">${svgParts.join('')}</svg>`;
}
