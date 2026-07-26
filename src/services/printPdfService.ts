import { marked } from 'marked';
import katex from 'katex';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { extractDiagrams, fetchKrokiSvg } from './krokiService';

/**
 * Direct PDF File Downloader via html2canvas & jsPDF
 * Directly generates and downloads a .pdf file without opening Chrome's print popup window.
 */
export async function exportBubbleDirectPdf(content: string, modelUsed?: string, customTitle?: string): Promise<void> {
  const diagrams = extractDiagrams(content);
  const diagramMap = new Map<string, string>();

  for (let i = 0; i < diagrams.length; i++) {
    const diag = diagrams[i];
    const token = `PRINTDIAGRAMTOKEN${i}ENDTOKEN`;
    const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
    diagramMap.set(
      token,
      `<div class="pdf-diagram-page" data-type="${diag.type}">${svgHtml}</div>`
    );
  }

  let markdownToParse = renderMathForPrint(content);
  let tokenIndex = 0;
  diagrams.forEach(diag => {
    const token = `PRINTDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
    markdownToParse = markdownToParse.replace(diag.fullMatch, token);
  });

  let parsedHtml = marked.parse(markdownToParse) as string;

  diagramMap.forEach((svgContainerHtml, token) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replace(token, svgContainerHtml);
    }
  });

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px';
  tempContainer.style.background = '#ffffff';
  tempContainer.style.color = '#0f172a';
  tempContainer.style.padding = '32px';
  tempContainer.style.fontFamily = "'Inter', sans-serif";

  const fileName = customTitle || `ProfJoe_${modelUsed ? modelUsed.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}`;

  tempContainer.innerHTML = `
    <div style="border-bottom: 2px solid #06b6d4; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 1.4rem; margin: 0; color: #06b6d4;">Prof. Joe AI Document</h1>
      <div style="font-size: 0.85rem; color: #64748b;">Model: ${modelUsed || 'AI Model'} | Date: ${new Date().toLocaleDateString()}</div>
    </div>
    <div class="markdown-content" style="line-height: 1.65; color: #0f172a;">
      ${parsedHtml}
    </div>
  `;

  document.body.appendChild(tempContainer);

  try {
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

/**
 * Pre-processes LaTeX math formulas ($...$ and $$...$$) into KaTeX HTML strings
 */
function renderMathForPrint(content: string): string {
  if (!content) return '';
  // Replace block math $$ ... $$
  let processed = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    try {
      return `<div class="katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `$$${math}$$`;
    }
  });

  // Replace inline math $ ... $
  processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `$${math}$`;
    }
  });

  return processed;
}

/**
 * Native Printable PDF Engine via Print Iframe & @media print CSS
 * Produces a printable document with 100% real selectable text and dedicated pages for Kroki diagrams.
 */
export async function printBubbleToPdf(content: string, modelUsed?: string, customTitle?: string): Promise<void> {
  // 1. Extract Kroki diagrams
  const diagrams = extractDiagrams(content);
  const diagramMap = new Map<string, string>();

  for (let i = 0; i < diagrams.length; i++) {
    const diag = diagrams[i];
    const token = `PRINTDIAGRAMTOKEN${i}ENDTOKEN`;
    const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
    // Wrap SVG in dedicated page container
    diagramMap.set(
      token,
      `<div class="pdf-diagram-page" data-type="${diag.type}">${svgHtml}</div>`
    );
  }

  // 2. Replace code blocks with unique tokens before Markdown parsing
  let markdownToParse = renderMathForPrint(content);
  let tokenIndex = 0;
  diagrams.forEach(diag => {
    const token = `PRINTDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
    markdownToParse = markdownToParse.replace(diag.fullMatch, token);
  });

  // 3. Parse Markdown into clean HTML
  let parsedHtml = marked.parse(markdownToParse) as string;

  // 4. Restore SVG diagram page containers into parsed HTML
  diagramMap.forEach((svgContainerHtml, token) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replace(token, svgContainerHtml);
    }
  });

  // 5. Build printable HTML document
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const docTitle = customTitle || `ProfJoe_${modelUsed ? modelUsed.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}`;

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${docTitle}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            padding: 32px;
            margin: 0;
            line-height: 1.65;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-header {
            border-bottom: 2px solid rgba(6, 182, 212, 0.4);
            padding-bottom: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .print-header h1 {
            font-size: 1.4rem;
            margin: 0;
            color: #06b6d4;
          }

          .print-meta {
            font-size: 0.85rem;
            color: #64748b;
          }

          .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
            color: #0f172a;
            margin-top: 18px;
            margin-bottom: 8px;
          }

          .markdown-content p {
            margin-bottom: 12px;
          }

          .markdown-content strong {
            color: #06b6d4;
          }

          .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
          }

          .markdown-content th, .markdown-content td {
            border: 1px solid rgba(148, 163, 184, 0.3);
            padding: 8px 12px;
            text-align: left;
          }

          .markdown-content th {
            background: rgba(6, 182, 212, 0.1);
            color: #06b6d4;
          }

          /* Dedicated Page Break for Diagrams */
          .pdf-diagram-page {
            page-break-before: always;
            break-before: page;
            margin: 24px 0;
            padding: 24px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .pdf-diagram-page svg {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
          }

          .pdf-diagram-page svg text {
            fill: #0f172a !important;
            font-family: 'Inter', sans-serif !important;
          }

          @media print {
            body {
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
              color: #0f172a !important;
            }
            .pdf-diagram-page {
              page-break-before: always !important;
              break-before: page !important;
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>ChatterBot AI Document</h1>
          <div class="print-meta">Model: ${modelUsed || 'AI Model'} | Date: ${new Date().toLocaleDateString()}</div>
        </div>
        <div class="markdown-content">
          ${parsedHtml}
        </div>
      </body>
    </html>
  `;

  executePrintDocument(printHtml);
}

function executePrintDocument(printHtml: string): void {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(printHtml);
      printWin.document.close();
      setTimeout(() => {
        printWin.focus();
        printWin.print();
      }, 500);
      return;
    }
  }

  // Desktop printable iframe fallback
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(printHtml);
  doc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1000);
  }, 400);
}

/**
 * Printable Full Chat Session Export Engine
 * Loops over all user prompts and assistant answers, parses Markdown and Kroki SVGs,
 * and renders a clean, paginated printable PDF document.
 */
export async function printSessionToPdf(messages: any[], sessionTitle: string = 'Prof. Joe AI Chat Session'): Promise<void> {
  if (!messages || messages.length === 0) return;

  let sessionHtmlContent = '';

  for (let mIdx = 0; mIdx < messages.length; mIdx++) {
    const msg = messages[mIdx];
    const isUser = msg.role === 'user';
    const roleTitle = isUser ? '👤 User Query' : `🎓 Prof. Joe AI (${msg.model || 'Assistant'})`;

    const diagrams = extractDiagrams(msg.content || '');
    const diagramMap = new Map<string, string>();

    for (let i = 0; i < diagrams.length; i++) {
      const diag = diagrams[i];
      const token = `PRINTDIAGRAMTOKEN${mIdx}_${i}ENDTOKEN`;
      const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
      diagramMap.set(
        token,
        `<div class="pdf-diagram-page" data-type="${diag.type}">${svgHtml}</div>`
      );
    }

    let markdownToParse = renderMathForPrint(msg.content || '');
    let tokenIndex = 0;
    diagrams.forEach(diag => {
      const token = `PRINTDIAGRAMTOKEN${mIdx}_${tokenIndex++}ENDTOKEN`;
      markdownToParse = markdownToParse.replace(diag.fullMatch, token);
    });

    let parsedHtml = marked.parse(markdownToParse) as string;

    diagramMap.forEach((svgContainerHtml, token) => {
      const paragraphWrapped = `<p>${token}</p>`;
      if (parsedHtml.includes(paragraphWrapped)) {
        parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
      } else {
        parsedHtml = parsedHtml.replace(token, svgContainerHtml);
      }
    });

    sessionHtmlContent += `
      <div class="message-block ${isUser ? 'user-block' : 'assistant-block'}">
        <div class="message-header">${roleTitle}</div>
        <div class="markdown-content">
          ${parsedHtml}
        </div>
      </div>
    `;
  }

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${sessionTitle} - Full Chat Export</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            padding: 32px;
            margin: 0;
            line-height: 1.65;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .print-header {
            border-bottom: 2px solid #06b6d4;
            padding-bottom: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .print-header h1 {
            font-size: 1.4rem;
            margin: 0;
            color: #06b6d4;
          }

          .print-meta {
            font-size: 0.85rem;
            color: #64748b;
          }

          .message-block {
            margin-bottom: 20px;
            padding: 16px 20px;
            border-radius: 12px;
            border: 1px solid rgba(148, 163, 184, 0.2);
          }

          .user-block {
            background: rgba(6, 182, 212, 0.05);
            border-left: 4px solid #06b6d4;
          }

          .assistant-block {
            background: rgba(30, 41, 59, 0.05);
            border-left: 4px solid #818cf8;
          }

          .message-header {
            font-weight: 700;
            font-size: 0.9rem;
            margin-bottom: 8px;
            color: #06b6d4;
          }

          .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
            color: #0f172a;
            margin-top: 14px;
            margin-bottom: 6px;
          }

          .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
          }

          .markdown-content th, .markdown-content td {
            border: 1px solid rgba(148, 163, 184, 0.3);
            padding: 8px 12px;
            text-align: left;
          }

          .markdown-content th {
            background: rgba(6, 182, 212, 0.1);
            color: #06b6d4;
          }

          .pdf-diagram-page {
            margin: 16px 0;
            padding: 16px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          .pdf-diagram-page svg {
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
          }

          @media print {
            body {
              padding: 0;
              background: #ffffff !important;
              color: #0f172a !important;
            }
            .markdown-content h1, .markdown-content h2, .markdown-content h3, .markdown-content h4, .markdown-content h5, .markdown-content h6 {
              color: #0f172a !important;
            }
            .message-block {
              border-color: #cbd5e1 !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Prof. Joe AI — ${sessionTitle}</h1>
          <div class="print-meta">Messages: ${messages.length} | Date: ${new Date().toLocaleDateString()}</div>
        </div>
        ${sessionHtmlContent}
      </body>
    </html>
  `;

  executePrintDocument(printHtml);
}
