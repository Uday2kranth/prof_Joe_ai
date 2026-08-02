// Kroki Diagram Service - Concurrency Control, IndexedDB Persistent Caching & Abort Timeout
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
            if (next) setTimeout(next, 100);
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
 * Fetches inline SVG string from Kroki POST API with IndexedDB persistent caching & timeout
 */
export async function fetchKrokiSvg(diagramType: string, source: string): Promise<string> {
  const cacheKey = `kroki_svg_${diagramType}_${source}`;

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

  // 3. Enqueue throttled network request with 5s timeout
  return enqueueRequest(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

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
        throw new Error(`Kroki ${diagramType.toUpperCase()} Engine returned HTTP ${response.status}`);
      }

      const svgText = await response.text();
      if (svgText && svgText.includes('<svg')) {
        inMemorySvgCache.set(cacheKey, svgText);
        setRenderCache(cacheKey, svgText);
        return svgText;
      } else {
        throw new Error(`Invalid SVG response from ${diagramType}`);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isAbort = err.name === 'AbortError';
      const errMsg = isAbort ? 'Request timed out (6s)' : (err.message || 'Network error');
      
      const formattedType = diagramType.toUpperCase();
      const fallbackBadge = `
        <div class="kroki-error-badge" style="margin: 12px 0; padding: 12px 16px; border: 1px dashed rgba(239, 68, 68, 0.4); border-radius: 8px; background: rgba(239, 68, 68, 0.05); color: #ef4444; font-family: monospace; font-size: 0.82rem;">
          <div style="font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span>⚠️ Diagram Render Notice (${formattedType})</span>
          </div>
          <div style="opacity: 0.85; font-size: 0.78rem;">${errMsg}</div>
        </div>
      `;
      return fallbackBadge;
    }
  });
}
