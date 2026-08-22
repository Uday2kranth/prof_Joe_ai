import { renderMathHtml } from '../components/MathText';

export function renderMarkdownWithMathAndDiagrams(content: string, diagramMapObj: Record<string, string>): string {
  if (!content) return '';
  const diagramMap = new Map<string, string>(Object.entries(diagramMapObj || {}));
  return renderMathHtml(content, { diagramMap });
}

self.onmessage = (e: MessageEvent) => {
  const { id, content, diagramMapObj } = e.data || {};
  if (!content) {
    self.postMessage({ id, html: '' });
    return;
  }
  try {
    const html = renderMarkdownWithMathAndDiagrams(content, diagramMapObj || {});
    self.postMessage({ id, html });
  } catch (err: any) {
    self.postMessage({ id, html: content, error: err?.message });
  }
};
