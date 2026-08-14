import { marked } from 'marked';
import katex from 'katex';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { extractDiagrams, fetchKrokiSvg } from './krokiService';

export interface ExportPdfThemeOptions {
  primary?: string;
  accent?: string;
  cardBg?: string;
  textColor?: string;
  headerBorder?: string;
  tableHeaderBg?: string;
  tableHeaderText?: string;
  tableBorder?: string;
  tableRowOdd?: string;
  tableRowEven?: string;
}

/**
 * Direct PDF File Downloader via html2canvas & jsPDF with customizable color themes
 */
export async function exportBubbleDirectPdf(
  content: string,
  modelUsed?: string,
  customTitle?: string,
  theme?: ExportPdfThemeOptions
): Promise<void> {
  const diagrams = extractDiagrams(content);
  const diagramMap = new Map<string, string>();

  const svgPromises = diagrams.map(async (diag, i) => {
    const token = `PRINTDIAGRAMTOKEN${i}ENDTOKEN`;
    const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
    return { token, svgHtml, type: diag.type };
  });

  const svgResults = await Promise.all(svgPromises);
  svgResults.forEach(res => {
    diagramMap.set(
      res.token,
      `<div class="pdf-diagram-page" data-type="${res.type}">${res.svgHtml}</div>`
    );
  });

  let markdownToParse = content;
  let tokenIndex = 0;
  diagrams.forEach(diag => {
    const token = `PRINTDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
    markdownToParse = markdownToParse.replace(diag.fullMatch, token);
  });

  const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

  const primaryColor = theme?.primary || '#06b6d4';
  const headerBorderColor = theme?.headerBorder || primaryColor;
  const tableHeaderBg = theme?.tableHeaderBg || 'rgba(6, 182, 212, 0.15)';
  const tableHeaderText = theme?.tableHeaderText || primaryColor;
  const tableBorder = theme?.tableBorder || 'rgba(6, 182, 212, 0.3)';
  const tableRowOdd = theme?.tableRowOdd || 'rgba(255, 255, 255, 0.75)';
  const tableRowEven = theme?.tableRowEven || 'rgba(240, 249, 255, 0.82)';
  const bgColor = theme?.cardBg && !theme.cardBg.includes('rgba') ? theme.cardBg : '#ffffff';
  const textColor = theme?.textColor || '#0f172a';

  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'fixed';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '800px';
  tempContainer.style.background = bgColor;
  tempContainer.style.color = textColor;
  tempContainer.style.padding = '32px';
  tempContainer.style.fontFamily = "'Inter', sans-serif";

  const fileName = customTitle || `ProfJoe_${modelUsed ? modelUsed.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}`;

  tempContainer.innerHTML = `
    <style>
      table { width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid ${tableBorder}; background: ${bgColor}; }
      th, td { border: 1px solid ${tableBorder}; padding: 10px 14px; text-align: left; font-size: 0.9rem; color: ${textColor}; }
      th { background-color: ${tableHeaderBg}; color: ${tableHeaderText}; font-weight: 700; }
      tr:nth-child(odd) { background-color: ${tableRowOdd}; }
      tr:nth-child(even) { background-color: ${tableRowEven}; }
      code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; }
      pre { background: rgba(0,0,0,0.04); padding: 12px; border-radius: 8px; border: 1px solid ${tableBorder}; overflow-x: auto; }
      blockquote { border-left: 4px solid ${primaryColor}; margin: 0; padding-left: 14px; color: #475569; }
    </style>
    <div style="border-bottom: 2px solid ${headerBorderColor}; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 1.4rem; margin: 0; color: ${primaryColor}; font-weight: 700;">Prof. Joe AI Document</h1>
      <div style="font-size: 0.85rem; color: #64748b;">Model: ${modelUsed || 'AI Model'} | Date: ${new Date().toLocaleDateString()}</div>
    </div>
    <div class="markdown-content" style="line-height: 1.65; color: ${textColor};">
      ${parsedHtml}
    </div>
  `;

  document.body.appendChild(tempContainer);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    await new Promise<void>((resolve, reject) => {
      pdf.html(tempContainer, {
        callback: (doc) => {
          try {
            doc.save(`${fileName}.pdf`);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        x: 10,
        y: 10,
        width: 190,
        windowWidth: 800,
        autoPaging: 'text',
        html2canvas: {
          useCORS: true,
          scale: 2,
          backgroundColor: bgColor
        }
      });
    });
  } catch (error) {
    console.error('Error generating PDF via html2canvas:', error);
    // Fallback: html2canvas direct capture with page margin calculations
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      backgroundColor: bgColor
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    const contentWidth = 190;
    const pageContentHeight = 277;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = margin;

    pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
    heightLeft -= pageContentHeight;

    while (heightLeft > 0) {
      position = margin - (imgHeight - heightLeft);
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, contentWidth, imgHeight);
      heightLeft -= pageContentHeight;
    }

    pdf.save(`${fileName}.pdf`);
  } finally {
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }
  }
}

function parseMarkdownWithMathAndDiagrams(content: string, diagramMap: Map<string, string>): string {
  if (!content) return '';
  const mathMap = new Map<string, string>();
  let tokenIdx = 0;

  // 1. Extract block math $$...$$ and \[...\]
  let prepped = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<div class="katex-display katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `$$${math}$$`);
    }
    return token;
  });

  prepped = prepped.replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => {
    const token = `KATEXBLOCKTOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<div class="katex-display katex-block">${katex.renderToString(math.trim(), { displayMode: true, throwOnError: false })}</div>`);
    } catch {
      mathMap.set(token, `\\[${math}\\]`);
    }
    return token;
  });

  // 2. Extract inline math \(...\) and $...$
  prepped = prepped.replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<span class="katex-inline">${katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })}</span>`);
    } catch {
      mathMap.set(token, `\\(${math}\\)`);
    }
    return token;
  });

  prepped = prepped.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const token = `KATEXINLINETOKEN${tokenIdx++}ENDTOKEN`;
    try {
      mathMap.set(token, `<span class="katex-inline">${katex.renderToString(math.trim(), { displayMode: false, throwOnError: false })}</span>`);
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
  diagramMap.forEach((svgContainerHtml, token) => {
    const paragraphWrapped = `<p>${token}</p>`;
    if (parsedHtml.includes(paragraphWrapped)) {
      parsedHtml = parsedHtml.replace(paragraphWrapped, svgContainerHtml);
    } else {
      parsedHtml = parsedHtml.replaceAll(token, svgContainerHtml);
    }
  });

  return parsedHtml;
}

/**
 * Native Printable PDF Engine via Print Window / Iframe
 */
export async function printBubbleToPdf(content: string, modelUsed?: string, customTitle?: string): Promise<void> {
  const isAndroidBridge = typeof window !== 'undefined' && Boolean((window as any).AndroidPrintBridge?.printHtml);

  // Fetch diagrams in parallel
  const diagrams = extractDiagrams(content);
  const diagramMap = new Map<string, string>();

  const svgResults = await Promise.all(
    diagrams.map(async (diag, i) => {
      const token = `PRINTDIAGRAMTOKEN${i}ENDTOKEN`;
      const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
      return { token, svgHtml, type: diag.type };
    })
  );

  svgResults.forEach(res => {
    diagramMap.set(
      res.token,
      `<div class="pdf-diagram-page" data-type="${res.type}">${res.svgHtml}</div>`
    );
  });

  let markdownToParse = content;
  let tokenIndex = 0;
  diagrams.forEach(diag => {
    const token = `PRINTDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
    markdownToParse = markdownToParse.replace(diag.fullMatch, token);
  });

  const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const docTitle = customTitle || `ProfJoe_${modelUsed ? modelUsed.replace(/[^a-zA-Z0-9.-]/g, '_') : 'Export'}_${new Date().toISOString().split('T')[0]}`;

  const printHtml = buildPrintHtmlDocument(docTitle, parsedHtml, bgColor, textColor, modelUsed);

  // 1. Android Native Print Bridge Integration (Direct System Print dialog, zero blank pages)
  if (isAndroidBridge) {
    (window as any).AndroidPrintBridge.printHtml(printHtml);
    return;
  }

  // 2. Web & Desktop: Use Clean Hidden Iframe Print Engine (Avoids window.open blank trap)
  try {
    const targetIframe = document.createElement('iframe');
    targetIframe.style.position = 'fixed';
    targetIframe.style.right = '0';
    targetIframe.style.bottom = '0';
    targetIframe.style.width = '0';
    targetIframe.style.height = '0';
    targetIframe.style.border = '0';
    targetIframe.style.visibility = 'hidden';
    document.body.appendChild(targetIframe);

    if (targetIframe.contentWindow) {
      const doc = targetIframe.contentWindow.document;
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          targetIframe.contentWindow?.focus();
          targetIframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print failed, falling back to direct PDF download', printErr);
          exportBubbleDirectPdf(content, modelUsed, customTitle);
        } finally {
          setTimeout(() => {
            if (document.body.contains(targetIframe)) {
              document.body.removeChild(targetIframe);
            }
          }, 1500);
        }
      }, 350);
    }
  } catch (err) {
    console.error('Print execution failed, falling back to direct PDF file generation:', err);
    await exportBubbleDirectPdf(content, modelUsed, customTitle);
  }
}

/**
 * Printable Full Chat Session Export Engine (Optimized & Non-blocking)
 */
export async function printSessionToPdf(messages: any[], sessionTitle: string = 'Prof. Joe AI Chat Session'): Promise<void> {
  if (!messages || messages.length === 0) return;
  const isAndroidBridge = typeof window !== 'undefined' && Boolean((window as any).AndroidPrintBridge?.printHtml);

  // Parallel processing across all messages in session
  const processedMessagePromises = messages.map(async (msg, mIdx) => {
    const isUser = msg.role === 'user';
    const roleTitle = isUser ? '👤 User Query' : `🎓 Prof. Joe AI (${msg.model || 'Assistant'})`;

    const diagrams = extractDiagrams(msg.content || '');
    const diagramMap = new Map<string, string>();

    const svgPromises = diagrams.map(async (diag, i) => {
      const token = `PRINTDIAGRAMTOKEN${mIdx}_${i}ENDTOKEN`;
      const svgHtml = await fetchKrokiSvg(diag.type, diag.source);
      return { token, svgHtml, type: diag.type };
    });

    const svgResults = await Promise.all(svgPromises);
    svgResults.forEach(res => {
      diagramMap.set(
        res.token,
        `<div class="pdf-diagram-page" data-type="${res.type}">${res.svgHtml}</div>`
      );
    });

    let markdownToParse = msg.content || '';
    let tokenIndex = 0;
    diagrams.forEach(diag => {
      const token = `PRINTDIAGRAMTOKEN${mIdx}_${tokenIndex++}ENDTOKEN`;
      markdownToParse = markdownToParse.replace(diag.fullMatch, token);
    });

    const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

    return `
      <div class="message-block ${isUser ? 'user-block' : 'assistant-block'}">
        <div class="message-header">${roleTitle}</div>
        <div class="markdown-content">
          ${parsedHtml}
        </div>
      </div>
    `;
  });

  const sessionHtmlBlocks = await Promise.all(processedMessagePromises);
  const sessionHtmlContent = sessionHtmlBlocks.join('');

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

  // 1. Android Native Print Bridge
  if (isAndroidBridge) {
    (window as any).AndroidPrintBridge.printHtml(printHtml);
    return;
  }

  // 2. Web & Desktop: Clean Hidden Iframe
  try {
    const targetIframe = document.createElement('iframe');
    targetIframe.style.position = 'fixed';
    targetIframe.style.right = '0';
    targetIframe.style.bottom = '0';
    targetIframe.style.width = '0';
    targetIframe.style.height = '0';
    targetIframe.style.border = '0';
    targetIframe.style.visibility = 'hidden';
    document.body.appendChild(targetIframe);

    if (targetIframe.contentWindow) {
      const doc = targetIframe.contentWindow.document;
      doc.open();
      doc.write(printHtml);
      doc.close();

      setTimeout(() => {
        try {
          targetIframe.contentWindow?.focus();
          targetIframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe session print failed', printErr);
        } finally {
          setTimeout(() => {
            if (document.body.contains(targetIframe)) {
              document.body.removeChild(targetIframe);
            }
          }, 1500);
        }
      }, 350);
    }
  } catch (err) {
    console.error('Session print execution failed:', err);
  }
}

function buildPrintHtmlDocument(docTitle: string, parsedHtml: string, bgColor: string, textColor: string, modelUsed?: string): string {
  return `
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
          <h1>Prof. Joe AI Document</h1>
          <div class="print-meta">Model: ${modelUsed || 'AI Model'} | Date: ${new Date().toLocaleDateString()}</div>
        </div>
        <div class="markdown-content">
          ${parsedHtml}
        </div>
      </body>
    </html>
  `;
}
