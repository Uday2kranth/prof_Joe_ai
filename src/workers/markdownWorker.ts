import { marked } from 'marked';
import katex from 'katex';

marked.setOptions({
  gfm: true,
  breaks: true
});

export function renderMarkdownWithMathAndDiagrams(content: string, diagramMapObj: Record<string, string>): string {
  if (!content) return '';
  const mathMap = new Map<string, string>();
  let tokenIdx = 0;

  // 1. Extract block math $$...$$
  let prepped = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<div class="katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `$$${math}$$`);
    }
    return token;
  });

  // 2. Extract inline math $...$
  prepped = prepped.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, katex.renderToString(math.trim(), { displayMode: false, throwOnError: false }));
    } catch {
      mathMap.set(token, `$${math}$`);
    }
    return token;
  });

  // 3. Parse clean markdown tables and text
  let parsedHtml = marked.parse(prepped) as string;

  // 4. Restore math HTML
  mathMap.forEach((html, token) => {
    parsedHtml = parsedHtml.replaceAll(token, html);
  });

  // 5. Restore Kroki diagram containers
  Object.entries(diagramMapObj).forEach(([token, svgContainerHtml]) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replaceAll(token, svgContainerHtml);
    }
  });

  return parsedHtml;
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
