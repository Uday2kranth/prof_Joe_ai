import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { extractDiagrams, fetchKrokiSvg } from './krokiService';
import { renderMathHtml } from '../components/MathText';
import type { PinnedItem } from '../types';

export interface PrintCustomConfig {
  preset: 'academic' | 'clean' | 'branded' | 'custom';
  showHeader: boolean;
  customTitle: string;
  showModelTag: boolean;
  showDateTag: boolean;
  showWorkspaceTag: boolean;
  showFooter: boolean;
  marginPreset: 'standard' | 'compact' | 'none';
  hideDividers: boolean;
}

export const DEFAULT_PRINT_CONFIG: PrintCustomConfig = {
  preset: 'academic',
  showHeader: true,
  customTitle: '',
  showModelTag: true,
  showDateTag: true,
  showWorkspaceTag: true,
  showFooter: true,
  marginPreset: 'standard',
  hideDividers: false
};

export function getPrintCustomConfig(): PrintCustomConfig {
  if (typeof window === 'undefined') return DEFAULT_PRINT_CONFIG;
  try {
    const saved = localStorage.getItem('chatterbot_print_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_PRINT_CONFIG, ...parsed };
    }
  } catch {}
  return DEFAULT_PRINT_CONFIG;
}

export function savePrintCustomConfig(cfg: Partial<PrintCustomConfig>): PrintCustomConfig {
  const current = getPrintCustomConfig();
  const updated = { ...current, ...cfg };
  if (typeof window !== 'undefined') {
    localStorage.setItem('chatterbot_print_config', JSON.stringify(updated));
  }
  return updated;
}

export type PrintHeaderMode = 'academic' | 'clean' | 'branded' | 'custom';

export function getPrintHeaderMode(): PrintHeaderMode {
  return getPrintCustomConfig().preset;
}

export function setPrintHeaderMode(mode: PrintHeaderMode): void {
  if (mode === 'academic') {
    savePrintCustomConfig({ preset: 'academic', showHeader: true, showModelTag: true, showDateTag: true, showWorkspaceTag: true, showFooter: true });
  } else if (mode === 'clean') {
    savePrintCustomConfig({ preset: 'clean', showHeader: false, showModelTag: false, showDateTag: false, showWorkspaceTag: false, showFooter: false });
  } else if (mode === 'branded') {
    savePrintCustomConfig({ preset: 'branded', showHeader: true, showModelTag: true, showDateTag: true, showWorkspaceTag: true, showFooter: true });
  } else {
    savePrintCustomConfig({ preset: 'custom' });
  }
}

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
      .pdf-diagram-page {
        page-break-before: always !important;
        break-before: page !important;
        page-break-after: always !important;
        break-after: page !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        margin: 0 auto;
        padding: 20px 10px;
        background: #ffffff;
        border: 1px solid ${tableBorder};
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 82vh;
        box-sizing: border-box;
      }
      .pdf-diagram-page svg {
        max-width: 100% !important;
        max-height: 820px !important;
        width: auto !important;
        height: auto !important;
        display: block;
        margin: auto;
      }
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
  return renderMathHtml(content, { diagramMap });
}

/**
 * Universal Native Print Dispatcher: Routes seamlessly through Android Bridge or Hidden Iframe
 */
export function dispatchToPrintEngine(printHtml: string, fallbackAction?: () => void): void {
  const isAndroidBridge = typeof window !== 'undefined' && Boolean((window as any).AndroidPrintBridge?.printHtml);
  if (isAndroidBridge) {
    (window as any).AndroidPrintBridge.printHtml(printHtml);
    return;
  }

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
          console.warn('Iframe print failed:', printErr);
          if (fallbackAction) fallbackAction();
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
    console.error('Print execution failed:', err);
    if (fallbackAction) fallbackAction();
  }
}

/**
 * Native Printable PDF Engine for Single Message / Code Lab Solution
 */
export async function printBubbleToPdf(content: string, modelUsed?: string, customTitle?: string): Promise<void> {
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

  dispatchToPrintEngine(printHtml, () => {
    exportBubbleDirectPdf(content, modelUsed, customTitle);
  });
}

/**
 * 🖨️ LEVEL 1: Message-Wise / Single Pinned Note Revision Print (Academic Paper Layout)
 */
export async function printSinglePinToPdf(pin: PinnedItem): Promise<void> {
  const ws = pin.workspace === 'code_lab' ? 'Code Dungeon 🏰' : pin.workspace === 'persona' ? 'Fun Persona 🎭' : 'AI Chat 💬';
  const docTitle = pin.sessionTitle || 'Revision Note';
  const metaText = `Workspace: ${ws} | Note ID: #${pin.id.slice(-8)} | Date: ${new Date(pin.createdAt).toLocaleDateString()}`;

  const diagrams = extractDiagrams(pin.content || '');
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

  let markdownToParse = pin.content || '';
  let tokenIndex = 0;
  diagrams.forEach(diag => {
    const token = `PRINTDIAGRAMTOKEN${tokenIndex++}ENDTOKEN`;
    markdownToParse = markdownToParse.replace(diag.fullMatch, token);
  });

  const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';

  const printHtml = buildPrintHtmlDocument(docTitle, parsedHtml, bgColor, textColor, pin.modelUsed || ws, metaText);

  dispatchToPrintEngine(printHtml);
}

/**
 * 🖨️ LEVEL 2: Session-Wise Pinned Notes Deck Print (Academic Multi-Card Paper Layout)
 */
export async function printSessionPinsToPdf(pins: PinnedItem[], sessionTitle: string = 'Session Revision Notes'): Promise<void> {
  if (!pins || pins.length === 0) return;

  const processedPinPromises = pins.map(async (p, idx) => {
    const ws = p.workspace === 'code_lab' ? 'Code Dungeon 🏰' : p.workspace === 'persona' ? 'Fun Persona 🎭' : 'AI Chat 💬';
    const diagrams = extractDiagrams(p.content || '');
    const diagramMap = new Map<string, string>();

    const svgResults = await Promise.all(
      diagrams.map(async (diag, i) => {
        const token = `PRINTDIAGRAMTOKEN${idx}_${i}ENDTOKEN`;
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

    let markdownToParse = p.content || '';
    let tokenIndex = 0;
    diagrams.forEach(diag => {
      const token = `PRINTDIAGRAMTOKEN${idx}_${tokenIndex++}ENDTOKEN`;
      markdownToParse = markdownToParse.replace(diag.fullMatch, token);
    });

    const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

    return `
      <div class="pin-card-section" style="margin-bottom: 28px; page-break-inside: avoid; break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(2, 132, 199, 0.4); padding-bottom: 6px; margin-bottom: 12px;">
          <h2 style="font-size: 1.15rem; margin: 0; color: #0284c7; font-weight: 700;">#${idx + 1}. ${p.sessionTitle || 'Revision Card'}</h2>
          <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">${ws}</span>
        </div>
        <div class="markdown-content">
          ${parsedHtml}
        </div>
      </div>
    `;
  });

  const pinBlocks = await Promise.all(processedPinPromises);
  const deckHtmlContent = pinBlocks.join('');

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';

  const docTitle = `Revision Deck: ${sessionTitle}`;
  const metaText = `Total Pinned Notes: ${pins.length} | Date: ${new Date().toLocaleDateString()}`;

  const printHtml = buildPrintHtmlDocument(docTitle, deckHtmlContent, bgColor, textColor, undefined, metaText);

  dispatchToPrintEngine(printHtml);
}

/**
 * Printable Full Chat Session Export Engine (Optimized, Non-blocking & Borderless Academic Flow)
 */
export async function printSessionToPdf(messages: any[], sessionTitle: string = 'Prof. Joe AI Chat Session'): Promise<void> {
  if (!messages || messages.length === 0) return;

  const processedMessagePromises = messages.map(async (msg, mIdx) => {
    const isUser = msg.role === 'user';
    const roleTitle = isUser ? '👤 User Query' : `🎓 Prof. Joe AI (${msg.model || 'Assistant'})`;

    const diagrams = extractDiagrams(msg.content || '');
    const diagramMap = new Map<string, string>();

    const svgResults = await Promise.all(
      diagrams.map(async (diag, i) => {
        const token = `PRINTDIAGRAMTOKEN${mIdx}_${i}ENDTOKEN`;
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

    let markdownToParse = msg.content || '';
    let tokenIndex = 0;
    diagrams.forEach(diag => {
      const token = `PRINTDIAGRAMTOKEN${mIdx}_${tokenIndex++}ENDTOKEN`;
      markdownToParse = markdownToParse.replace(diag.fullMatch, token);
    });

    const parsedHtml = parseMarkdownWithMathAndDiagrams(markdownToParse, diagramMap);

    return `
      <div class="session-message-flow" style="margin-bottom: 22px; padding-bottom: 14px; border-bottom: 1px dashed rgba(148, 163, 184, 0.35); page-break-inside: avoid; break-inside: avoid;">
        <div class="message-role-tag" style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px; color: ${isUser ? '#0284c7' : '#0369a1'};">
          ${roleTitle}
        </div>
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

  const docTitle = sessionTitle;
  const metaText = `Messages: ${messages.length} | Date: ${new Date().toLocaleDateString()}`;

  const printHtml = buildPrintHtmlDocument(docTitle, sessionHtmlContent, bgColor, textColor, undefined, metaText);

  dispatchToPrintEngine(printHtml);
}

export function buildPrintHtmlDocument(
  docTitle: string,
  parsedHtml: string,
  bgColor: string,
  textColor: string,
  modelUsed?: string,
  customMeta?: string
): string {
  const config = getPrintCustomConfig();
  
  // Custom document title override or clean fallback
  const effectiveTitle = config.customTitle && config.customTitle.trim() !== ''
    ? config.customTitle.trim()
    : (docTitle.startsWith('ProfJoe_') || docTitle.startsWith('Prof. Joe') ? 'Prof. Joe AI Document' : docTitle);

  // Dynamic metadata construction based on user checkboxes
  const metaParts: string[] = [];
  if (config.showModelTag && modelUsed) {
    metaParts.push(`Model: ${modelUsed}`);
  }
  if (config.showDateTag) {
    metaParts.push(`Date: ${new Date().toLocaleDateString()}`);
  }
  if (customMeta && !config.showModelTag && !config.showDateTag) {
    metaParts.push(customMeta);
  }
  const metaLine = metaParts.join(' | ');

  let headerHtml = '';
  if (config.showHeader) {
    if (config.preset === 'branded') {
      headerHtml = `
        <div class="print-header branded">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.5rem;">🎓</span>
            <div>
              <h1 style="margin: 0; font-size: 1.25rem; color: #0284c7; font-weight: 800;">Prof. Joe AI</h1>
              <div style="font-size: 0.8rem; color: #64748b; font-weight: 600;">${effectiveTitle}</div>
            </div>
          </div>
          ${metaLine ? `<div class="print-meta">${metaLine}</div>` : ''}
        </div>
      `;
    } else {
      headerHtml = `
        <div class="print-header">
          <h1>${effectiveTitle}</h1>
          ${metaLine ? `<div class="print-meta">${metaLine}</div>` : ''}
        </div>
      `;
    }
  }

  const footerHtml = config.showFooter ? `
    <div class="print-footer" style="margin-top: 32px; padding-top: 10px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 8pt; color: #94a3b8;">
      <span>${effectiveTitle}</span>
      <span>Printed via Prof. Joe AI</span>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${effectiveTitle}</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          @page {
            size: A4 portrait;
            ${config.marginPreset === 'none' ? 'margin: 0;' : config.marginPreset === 'compact' ? 'margin: 4mm 6mm 6mm 6mm;' : 'margin: 12mm 14mm 14mm 14mm;'}
          }

          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            background-color: ${bgColor};
            color: ${textColor};
            ${config.marginPreset === 'none' ? 'padding: 8px 12px;' : config.marginPreset === 'compact' ? 'padding: 12px 16px;' : 'padding: 24px 32px;'}
            margin: 0;
            line-height: 1.65;
          }

          ${config.hideDividers ? `.markdown-content hr, hr { display: none !important; margin: 0 !important; padding: 0 !important; height: 0 !important; border: none !important; }` : `.markdown-content hr, hr { border: 0; height: 1px; background: #e2e8f0; margin: 20px 0; }`}

          .print-header {
            border-bottom: 2px solid rgba(2, 132, 199, 0.4);
            padding-bottom: 12px;
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            page-break-after: avoid;
            break-after: avoid;
          }

          .print-header h1 {
            font-size: 1.35rem;
            margin: 0;
            color: #0284c7;
            font-weight: 700;
          }

          .print-meta {
            font-size: 0.82rem;
            color: #64748b;
            font-weight: 500;
          }

          .markdown-content h1, 
          .markdown-content h2, 
          .markdown-content h3, 
          .markdown-content h4, 
          .markdown-content h5, 
          .markdown-content h6 {
            color: #0f172a;
            margin-top: 18px;
            margin-bottom: 8px;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }

          .markdown-content p {
            margin-bottom: 12px;
          }

          .markdown-content strong {
            color: #0284c7;
          }

          .markdown-content table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            page-break-inside: auto;
            break-inside: auto;
          }

          .markdown-content thead {
            display: table-header-group;
          }

          .markdown-content tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .markdown-content th, 
          .markdown-content td {
            border: 1px solid rgba(148, 163, 184, 0.3);
            padding: 8px 12px;
            text-align: left;
            font-size: 0.92rem;
          }

          .markdown-content th {
            background: rgba(2, 132, 199, 0.1);
            color: #0369a1;
            font-weight: 700;
          }

          /* 💻 Code Block Wrap & Pagination Security */
          .markdown-content pre {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 10px 14px;
            border-radius: 8px;
            font-family: 'Consolas', 'Courier New', monospace;
            font-size: 8.8pt;
            line-height: 1.5;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            overflow: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 12px 0;
          }

          .markdown-content code {
            background: #f1f5f9;
            padding: 2px 5px;
            border-radius: 4px;
            font-size: 8.8pt;
            font-family: 'Consolas', 'Courier New', monospace;
            color: #0f172a;
            white-space: pre-wrap !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
          }

          /* 📐 KaTeX Formula Scaling & Scrollbar Elimination */
          .katex-display {
            margin: 12px 0 !important;
            padding: 4px 0 !important;
            font-size: 0.95em !important;
            max-width: 100% !important;
            overflow: visible !important;
            overflow-x: visible !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .katex {
            font-size: 0.95em !important;
            white-space: normal !important;
          }

          .katex-html {
            overflow: visible !important;
          }

          .session-message-flow, 
          .pin-card-section {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .pdf-diagram-page {
            page-break-before: always !important;
            break-before: page !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin: 0 auto;
            padding: 20px 10px;
            background: #ffffff;
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 82vh;
            box-sizing: border-box;
          }

          .pdf-diagram-page svg {
            max-width: 100% !important;
            max-height: 820px !important;
            width: auto !important;
            height: auto !important;
            display: block;
            margin: auto;
          }

          @media print {
            html, body {
              width: 100% !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
            }

            .markdown-content h1, 
            .markdown-content h2, 
            .markdown-content h3, 
            .markdown-content h4, 
            .markdown-content h5, 
            .markdown-content h6 {
              color: #0f172a !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
            }

            .markdown-content pre {
              background: #f8fafc !important;
              border: 1px solid #cbd5e1 !important;
              white-space: pre-wrap !important;
              word-break: break-word !important;
              overflow-wrap: break-word !important;
              overflow: visible !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .markdown-content code {
              white-space: pre-wrap !important;
              word-break: break-word !important;
              overflow-wrap: break-word !important;
            }

            .katex-display {
              overflow: visible !important;
              overflow-x: visible !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .katex {
              white-space: normal !important;
            }

            ::-webkit-scrollbar {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
            }

            .pdf-diagram-page {
              page-break-before: always !important;
              break-before: page !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              min-height: 90vh !important;
              box-shadow: none !important;
              border: 1px solid #e2e8f0 !important;
            }
          }
        </style>
      </head>
      <body>
        ${headerHtml}
        <div class="markdown-content">
          ${parsedHtml}
        </div>
        ${footerHtml}
      </body>
    </html>
  `;
}

