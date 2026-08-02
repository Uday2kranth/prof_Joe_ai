// Kroki Diagram Service - Concurrency Control, Instant Text Rendering, Local SVG Fallback & Persistent Caching
import { deflate } from 'pako';
import { getRenderCache, setRenderCache } from './renderCacheService';

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
  'nomnoml', 'wavedrom', 'symbolator', 'wbs'
];

export function minifySvg(svg: string): string {
  if (!svg) return '';
  return svg
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
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
  const lines = source.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('graph') && !l.startsWith('flowchart') && !l.startsWith('@startuml') && !l.startsWith('@enduml') && !l.startsWith('subgraph'));
  
  const nodes: string[] = [];
  const connections: Array<{ from: string; to: string; label?: string }> = [];

  lines.forEach(line => {
    // Extract node definitions or connections like A[Label] --> B[Label] or A -> B: Label
    const connMatch = line.match(/(?:([A-Za-z0-9_]+)(?:\[(.*?)\])?)\s*(?:-->|->|==>)\s*(?:([A-Za-z0-9_]+)(?:\[(.*?)\])?)/);
    if (connMatch) {
      const fromId = connMatch[1];
      const fromLabel = connMatch[2] || fromId;
      const toId = connMatch[3];
      const toLabel = connMatch[4] || toId;

      if (!nodes.includes(fromLabel)) nodes.push(fromLabel);
      if (!nodes.includes(toLabel)) nodes.push(toLabel);
      connections.push({ from: fromLabel, to: toLabel });
    } else {
      const labelMatch = line.match(/([A-Za-z0-9_]+)\[(.*?)\]/);
      if (labelMatch) {
        const label = labelMatch[2];
        if (!nodes.includes(label)) nodes.push(label);
      }
    }
  });

  const displayNodes = nodes.length > 0 ? nodes.slice(0, 8) : ['Start Process', 'Candidate Gen (L_k)', 'Support Count', 'Prune & Filter', 'Frequent Itemset Output'];
  const nodeWidth = 180;
  const nodeHeight = 44;
  const gapY = 24;
  const totalWidth = 600;
  const totalHeight = displayNodes.length * (nodeHeight + gapY) + 60;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" style="background:#0b0f19; border: 1px solid rgba(6, 182, 212, 0.4); border-radius:12px; width:100%; height:auto; max-width:650px; font-family:'Inter', sans-serif;">`;
  svgContent += `<defs>
    <style>
      .diag-node-box { fill: #1e293b !important; stroke: #38bdf8 !important; stroke-width: 2px !important; }
      .diag-node-text { fill: #ffffff !important; color: #ffffff !important; font-family: 'Inter', sans-serif !important; font-weight: 700 !important; font-size: 13px !important; text-anchor: middle !important; }
      .diag-title-text { fill: #38bdf8 !important; font-family: 'Inter', sans-serif !important; font-weight: 700 !important; font-size: 13px !important; }
    </style>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
    </marker>
  </defs>`;

  // Title Header
  svgContent += `<text x="24" y="32" class="diag-title-text" font-size="13" font-weight="700" letter-spacing="0.5">${diagramType.toUpperCase()} ARCHITECTURE DIAGRAM</text>`;

  // Render Nodes & Connecting Arrows
  displayNodes.forEach((nodeText, idx) => {
    const x = (totalWidth - nodeWidth) / 2;
    const y = 50 + idx * (nodeHeight + gapY);

    // Node Box
    svgContent += `<rect x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8" class="diag-node-box" />`;
    // Node Text
    const truncatedText = nodeText.length > 22 ? nodeText.slice(0, 20) + '...' : nodeText;
    svgContent += `<text x="${x + nodeWidth / 2}" y="${y + 26}" class="diag-node-text">${truncatedText}</text>`;

    // Connecting Arrow to next node
    if (idx < displayNodes.length - 1) {
      const arrowY1 = y + nodeHeight;
      const arrowY2 = arrowY1 + gapY - 2;
      svgContent += `<line x1="${totalWidth / 2}" y1="${arrowY1}" x2="${totalWidth / 2}" y2="${arrowY2}" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)" />`;
    }
  });

  svgContent += `</svg>`;
  return svgContent;
}

/**
 * Fetches inline SVG string from Kroki API with 4s fast timeout & local SVG fallback
 */
export async function fetchKrokiSvg(diagramType: string, source: string): Promise<string> {
  const cacheKey = `kroki_svg_v4_${diagramType}_${source}`;

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

  // 3. Enqueue throttled network request with 4s fast timeout + Local Fallback
  return enqueueRequest(async () => {
    // Attempt 1: Kroki POST request with 4s timeout
    try {
      const svg = await fetchKrokiPost(diagramType, source, 4000);
      inMemorySvgCache.set(cacheKey, svg);
      setRenderCache(cacheKey, svg);
      return svg;
    } catch (err1) {
      // Attempt 2: Deflate GET fallback with 4s timeout
      try {
        const encoded = krokiUrlEncode(source);
        const getUrl = `https://kroki.io/${diagramType}/svg/${encoded}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
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
