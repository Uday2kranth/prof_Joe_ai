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
            if (next) setTimeout(next, 80);
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
 * Fetches inline SVG string from Kroki API with 12s timeout, GET fallback, and IndexedDB caching
 */
export async function fetchKrokiSvg(diagramType: string, source: string): Promise<string> {
  const cacheKey = `kroki_svg_v3_${diagramType}_${source}`;

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

  // 3. Enqueue throttled network request with 12s timeout + GET fallback
  return enqueueRequest(async () => {
    // Attempt 1: Kroki POST request with 12s timeout
    try {
      const svg = await fetchKrokiPost(diagramType, source, 12000);
      inMemorySvgCache.set(cacheKey, svg);
      setRenderCache(cacheKey, svg);
      return svg;
    } catch (err1) {
      // Attempt 2: Deflate GET fallback for Mermaid / Kroki with 12s timeout
      try {
        const encoded = krokiUrlEncode(source);
        const getUrl = `https://kroki.io/${diagramType}/svg/${encoded}`;
        const res = await fetch(getUrl);
        if (res.ok) {
          const svgText = await res.text();
          if (svgText && svgText.includes('<svg')) {
            inMemorySvgCache.set(cacheKey, svgText);
            setRenderCache(cacheKey, svgText);
            return svgText;
          }
        }
      } catch (err2) {
        // Fallback below
      }

      const formattedType = diagramType.toUpperCase();
      const fallbackBadge = `
        <div class="kroki-error-badge" style="margin: 12px 0; padding: 12px 16px; border: 1px dashed rgba(245, 158, 11, 0.4); border-radius: 8px; background: rgba(245, 158, 11, 0.05); color: #f59e0b; font-family: monospace; font-size: 0.82rem;">
          <div style="font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <span>⚠️ Diagram Render Notice (${formattedType})</span>
          </div>
          <div style="opacity: 0.85; font-size: 0.78rem;">Server busy. Re-run or click retry to load SVG.</div>
        </div>
      `;
      return fallbackBadge;
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
