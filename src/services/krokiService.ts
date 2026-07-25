// Kroki Diagram Service - Inline SVG Fetching & Caching
const svgCache = new Map<string, string>();

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

/**
 * Extracts kroki or mermaid code blocks from text
 */
export function extractDiagrams(text: string): ExtractedDiagram[] {
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
 * Fetches inline SVG string from Kroki POST API with caching
 */
export async function fetchKrokiSvg(diagramType: string, source: string): Promise<string> {
  const cacheKey = `${diagramType}:${source}`;
  if (svgCache.has(cacheKey)) {
    return svgCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(`https://kroki.io/${diagramType}/svg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        diagram_source: source
      })
    });

    if (!response.ok) {
      throw new Error(`Kroki server HTTP ${response.status}`);
    }

    const svgText = await response.text();
    if (svgText && svgText.includes('<svg')) {
      svgCache.set(cacheKey, svgText);
      return svgText;
    } else {
      throw new Error('Invalid SVG returned');
    }
  } catch (err: any) {
    console.error(`Failed to fetch ${diagramType} diagram:`, err);
    return `<div class="kroki-error-box">⚠️ Unable to render ${diagramType} diagram: ${err.message || 'Error'}</div>`;
  }
}
