import { deflate } from 'pako';
import { getRenderCache, setRenderCache } from './renderCacheService';
import { parseFunctionPlotSource, renderFunctionPlotSvg } from './functionPlotService';
import { parseChartSpec, renderEChartsSvg, renderChartJsSvg, renderApexChartsSvg, renderCytoscapeSvg, renderMatrixSvg } from './clientChartsService';

const inMemorySvgCache = new Map<string, string>();

export interface ExtractedDiagram {
  type: string;
  source: string;
  fullMatch: string;
}

const KNOWN_DIAGRAM_TYPES = [
  'mermaid', 'plantuml', 'graphviz', 'erd', 'c4plantuml', 'd2',
  'blockdiag', 'seqdiag', 'actdiag', 'nwdiag', 'packetdiag',
  'rackdiag', 'ditaa', 'pikchr', 'umlet', 'bytefield', 'svgbob',
  'nomnoml', 'wavedrom', 'symbolator', 'wbs', 'functionplot', 'function-plot',
  'echarts', 'chartjs', 'chart.js', 'apexcharts', 'apexchart',
  'cytoscape', 'matrix', 'svg-matrix', 'matrix-diagram',
  'vegalite', 'vega-lite', 'vega'
];

export function minifySvg(svg: string): string {
  if (!svg) return '';
  let clean = svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();

  // If this is a self-styled dark function plot or styled SVG, preserve its custom text colors
  if (clean.includes('function-plot-svg')) {
    return clean;
  }

  // Inject universal contrast style inside the SVG defs / style
  const contrastStyle = '<style>text, tspan { fill: #0f172a !important; color: #0f172a !important; font-family: "Inter", system-ui, sans-serif !important; font-weight: 600 !important; font-size: 13px !important; visibility: visible !important; }</style>';
  if (clean.includes('<svg')) {
    clean = clean.replace(/<svg([^>]*)>/i, `<svg$1>${contrastStyle}`);
  }
  return clean;
}

// Concurrency Queue for Kroki API Calls (max 2 parallel requests)
const MAX_CONCURRENT_REQUESTS = 2;
let activeRequestCount = 0;
const requestQueue: Array<() => void> = [];

function enqueueRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const runTask = () => {
      activeRequestCount++;
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          activeRequestCount--;
          if (requestQueue.length > 0) {
            const next = requestQueue.shift();
            if (next) setTimeout(next, 50);
          }
        });
    };

    if (activeRequestCount < MAX_CONCURRENT_REQUESTS) {
      runTask();
    } else {
      requestQueue.push(runTask);
    }
  });
}

/**
 * Encodes diagram string into Kroki URL-safe zlib deflate base64 string
 */
function krokiUrlEncode(source: string): string {
  const data = new TextEncoder().encode(source);
  const compressed = deflate(data, { level: 9 });
  let binary = '';
  const len = compressed.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Extracts kroki or mermaid code blocks from text
 */
export function extractDiagrams(text: string): ExtractedDiagram[] {
  if (!text) return [];
  const diagrams: ExtractedDiagram[] = [];
  const regex = /```(?:kroki-([a-z0-9-]+)|([a-z0-9-]+))\s*([\s\S]*?)```/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const rawType = (match[1] || match[2] || '').toLowerCase();
    const source = match[3].trim();
    const isKrokiPrefix = Boolean(match[1]);

    if (source && (isKrokiPrefix || KNOWN_DIAGRAM_TYPES.includes(rawType))) {
      diagrams.push({
        type: rawType === 'wbs' ? 'plantuml' : rawType,
        source,
        fullMatch: match[0]
      });
    }
  }
  return diagrams;
}

/**
 * Native Client-Side Flowchart SVG Generator Fallback
 * Renders a clean visual SVG flowchart if remote Kroki API times out or fails.
 */
export function generateLocalFallbackSvg(diagramType: string, source: string): string {
  const cleanSource = source.replace(/%%[\s\S]*?$/gm, '').trim();
  const lines = cleanSource.split('\n').map(l => l.trim()).filter(Boolean);

  const idToLabel = new Map<string, string>();
  const connections: Array<{ from: string; to: string; label?: string }> = [];
  const nodeOrder: string[] = [];

  function cleanLabel(raw: string): string {
    if (!raw) return '';
    return raw
      .replace(/^["'`]|["'`]$/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/\\n/g, ' ')
      .trim();
  }

  // Pass 1: Extract all explicit node label definitions e.g. A["Machine Learning"], node1[Data Prep]
  lines.forEach(line => {
    const defRegex = /([A-Za-z0-9_-]+)\s*(?:\[\[|\[\(|\[|\(|\{|\(\[)\s*["']?([\s\S]*?)["']?\s*(?:\]\]|\)\]|\]|\)|\}|\)\])/g;
    let match;
    while ((match = defRegex.exec(line)) !== null) {
      const id = match[1].trim();
      const label = cleanLabel(match[2]);
      if (label && label !== id) {
        idToLabel.set(id, label);
      }
    }
  });

  // Pass 2: Extract connections and inline labels
  lines.forEach(line => {
    if (line.startsWith('graph') || line.startsWith('flowchart') || line.startsWith('subgraph') || line.startsWith('end') || line.startsWith('@startuml') || line.startsWith('@enduml')) {
      return;
    }

    const connRegex = /([A-Za-z0-9_-]+)(?:\s*\[["']?([\s\S]*?)["']?\])?\s*(?:-->|==>|->|-\.->)\s*(?:\|([^|]+)\|)?\s*([A-Za-z0-9_-]+)(?:\s*\[["']?([\s\S]*?)["']?\])?/g;
    let connMatch;
    while ((connMatch = connRegex.exec(line)) !== null) {
      const fromId = connMatch[1].trim();
      const fromInline = cleanLabel(connMatch[2]);
      const connLabel = cleanLabel(connMatch[3]);
      const toId = connMatch[4].trim();
      const toInline = cleanLabel(connMatch[5]);

      if (fromInline) idToLabel.set(fromId, fromInline);
      if (toInline) idToLabel.set(toId, toInline);

      const fromName = idToLabel.get(fromId) || (fromId.length > 2 ? fromId : '');
      const toName = idToLabel.get(toId) || (toId.length > 2 ? toId : '');

      if (fromName && !nodeOrder.includes(fromName)) nodeOrder.push(fromName);
      if (toName && !nodeOrder.includes(toName)) nodeOrder.push(toName);

      if (fromName && toName && fromName !== toName) {
        connections.push({ from: fromName, to: toName, label: connLabel });
      }
    }
  });

  // If no nodes found, extract any standalone brackets [Text]
  if (nodeOrder.length === 0) {
    lines.forEach(line => {
      const match = line.match(/\[(.*?)\]/);
      if (match) {
        const txt = cleanLabel(match[1]);
        if (txt && txt.length > 1 && !nodeOrder.includes(txt)) nodeOrder.push(txt);
      }
    });
  }

  // Filter out single-letter dummy nodes (like raw "A" or "B")
  const validNodes = nodeOrder.filter(n => n.length > 1 && n !== 'A' && n !== 'B' && n !== 'C' && n !== 'D');
  const displayNodes = validNodes.length > 0 ? validNodes.slice(0, 8) : ['Data Input', 'Preprocessing', 'Feature Extraction', 'Model Optimization', 'Output Predictions'];

  const totalWidth = 680;
  const nodeWidth = 210;
  const nodeHeight = 44;
  const gapY = 28;
  const totalHeight = displayNodes.length * (nodeHeight + gapY) + 64;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" style="background:#ffffff; border: 1px solid #e2e8f0; border-radius:12px; width:100%; height:auto; max-width:680px; font-family:'Inter', system-ui, sans-serif; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">`;
  svgContent += `<defs>
    <style>
      .diag-node-box { fill: #f8fafc !important; stroke: #0284c7 !important; stroke-width: 1.75px !important; }
      .diag-node-text { fill: #0f172a !important; color: #0f172a !important; font-family: 'Inter', system-ui, sans-serif !important; font-weight: 700 !important; font-size: 13px !important; text-anchor: middle !important; dominant-baseline: middle !important; }
      .diag-title-text { fill: #0369a1 !important; font-family: 'Inter', system-ui, sans-serif !important; font-weight: 800 !important; font-size: 13px !important; letter-spacing: 0.5px !important; }
      .diag-arrow-line { stroke: #0284c7 !important; stroke-width: 2px !important; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
    </marker>
  </defs>`;

  // Title Header
  svgContent += `<text x="24" y="30" class="diag-title-text" font-size="13" font-weight="800">📐 ${diagramType.toUpperCase()} ARCHITECTURAL WORKFLOW</text>`;

  // Render Nodes & Connecting Arrows
  displayNodes.forEach((nodeText, idx) => {
    const x = (totalWidth - nodeWidth) / 2;
    const y = 48 + idx * (nodeHeight + gapY);

    // Node Box
    svgContent += `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" class="diag-node-box" />`;
    // Node Text
    const truncatedText = nodeText.length > 24 ? nodeText.slice(0, 22) + '...' : nodeText;
    svgContent += `<text x="${x + nodeWidth / 2}" y="${y + nodeHeight / 2}" class="diag-node-text">${truncatedText}</text>`;

    // Connecting Arrow to next node
    if (idx < displayNodes.length - 1) {
      const arrowY1 = y + nodeHeight;
      const arrowY2 = arrowY1 + gapY - 2;
      svgContent += `<line x1="${totalWidth / 2}" y1="${arrowY1}" x2="${totalWidth / 2}" y2="${arrowY2}" class="diag-arrow-line" marker-end="url(#arrow)" />`;
    }
  });

  svgContent += `</svg>`;
  return svgContent;
}

/**
 * Fetches inline SVG string from Kroki API with 6.5s timeout & local SVG fallback
 */
export async function fetchKrokiSvg(diagramType: string, source: string): Promise<string> {
  const normType = (diagramType || '').toLowerCase();
  
  // Instant 100% Client-Side Render for Function Plot (Zero Network Latency)
  if (normType === 'functionplot' || normType === 'function-plot') {
    try {
      const spec = parseFunctionPlotSource(source);
      const svg = minifySvg(renderFunctionPlotSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local function plot SVG:', e);
    }
  }

  // Instant 100% Client-Side Render for Apache ECharts
  if (normType === 'echarts') {
    try {
      const spec = parseChartSpec(source);
      const svg = minifySvg(renderEChartsSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local ECharts SVG:', e);
    }
  }

  // Instant 100% Client-Side Render for Chart.js
  if (normType === 'chartjs' || normType === 'chart.js') {
    try {
      const spec = parseChartSpec(source);
      const svg = minifySvg(renderChartJsSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local Chart.js SVG:', e);
    }
  }

  // Instant 100% Client-Side Render for ApexCharts
  if (normType === 'apexcharts' || normType === 'apexchart') {
    try {
      const spec = parseChartSpec(source);
      const svg = minifySvg(renderApexChartsSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local ApexCharts SVG:', e);
    }
  }

  // Instant 100% Client-Side Render for Cytoscape Network & Layer Graphs
  if (normType === 'cytoscape') {
    try {
      const spec = parseChartSpec(source);
      const svg = minifySvg(renderCytoscapeSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local Cytoscape SVG:', e);
    }
  }

  // Instant 100% Client-Side Render for Computer Vision Matrix & Convolution
  if (normType === 'matrix' || normType === 'svg-matrix' || normType === 'matrix-diagram') {
    try {
      const spec = parseChartSpec(source);
      const svg = minifySvg(renderMatrixSvg(spec));
      return svg;
    } catch (e) {
      console.error('Failed to render local Matrix SVG:', e);
    }
  }

  const cacheKey = `kroki_svg_v6_${diagramType}_${source}`;

  // 1. Check in-memory cache
  if (inMemorySvgCache.has(cacheKey)) {
    return inMemorySvgCache.get(cacheKey)!;
  }

  // 2. Check IndexedDB persistent cache
  const dbCached = await getRenderCache(cacheKey);
  if (dbCached) {
    inMemorySvgCache.set(cacheKey, dbCached);
    return dbCached;
  }

  // 3. Enqueue throttled network request with 6.5s timeout + Local Fallback
  return enqueueRequest(async () => {
    // Attempt 1: Kroki POST request with 6.5s timeout
    try {
      const svg = await fetchKrokiPost(diagramType, source, 6500);
      inMemorySvgCache.set(cacheKey, svg);
      setRenderCache(cacheKey, svg);
      return svg;
    } catch (err1) {
      // Attempt 2: Deflate GET fallback with 6.5s timeout
      try {
        const encoded = krokiUrlEncode(source);
        const getUrl = `https://kroki.io/${diagramType}/svg/${encoded}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);
        const res = await fetch(getUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const svgText = await res.text();
          if (svgText && svgText.includes('<svg')) {
            const minified = minifySvg(svgText);
            inMemorySvgCache.set(cacheKey, minified);
            setRenderCache(cacheKey, minified);
            return minified;
          }
        }
      } catch (err2) {
        // Fallback to local SVG generator below
      }

      // Attempt 3: Immediate High-Performance Local SVG Flowchart Generator
      const fallbackSvg = minifySvg(generateLocalFallbackSvg(diagramType, source));
      inMemorySvgCache.set(cacheKey, fallbackSvg);
      setRenderCache(cacheKey, fallbackSvg);
      return fallbackSvg;
    }
  });
}

async function fetchKrokiPost(diagramType: string, source: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`https://kroki.io/${diagramType}/svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        diagram_source: source
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const svgText = await response.text();
    if (svgText && svgText.includes('<svg')) {
      return svgText;
    } else {
      throw new Error('Invalid SVG response');
    }
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}
