import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
// Vite URL import for local PDF.js worker bundling (100% offline, zero CDN dependency)
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Configure local PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface ExtractedResult {
  fileName: string;
  fileSizeKb: number;
  formatType: string;
  wordCount: number;
  charCount: number;
  extractedText: string;
  embeddedImages: string[]; // Array of Base64 image data URLs
}

/**
 * Converts HTML <table> elements into clean Markdown tables.
 */
function convertHtmlTablesToMarkdown(htmlDoc: Document): void {
  const tables = htmlDoc.querySelectorAll('table');
  tables.forEach((table) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    if (rows.length === 0) return;

    const markdownRows: string[] = [];

    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('th, td')).map(cell => 
        (cell.textContent || '').trim().replace(/\|/g, '\\|').replace(/\s+/g, ' ')
      );

      if (cells.length === 0) return;

      markdownRows.push(`| ${cells.join(' | ')} |`);

      // Add table header separator line after the first row
      if (rowIndex === 0) {
        const separator = cells.map(() => '---').join(' | ');
        markdownRows.push(`| ${separator} |`);
      }
    });

    const markdownText = `\n\n${markdownRows.join('\n')}\n\n`;
    const textNode = htmlDoc.createTextNode(markdownText);
    table.parentNode?.replaceChild(textNode, table);
  });
}

/**
 * Main Unified Extraction Pipeline
 */
export async function extractFileContent(file: File): Promise<ExtractedResult> {
  const sizeKb = Math.round(file.size / 1024);
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let extractedText = '';
  let formatType = ext.toUpperCase();
  const embeddedImages: string[] = [];

  try {
    // 1. Jupyter Notebook (.ipynb)
    if (ext === 'ipynb') {
      formatType = 'JUPYTER NOTEBOOK';
      const rawJson = await file.text();
      try {
        const notebook = JSON.parse(rawJson);
        const cells = notebook.cells || [];
        const lines: string[] = [`# Notebook: ${fileName}\n`];

        cells.forEach((cell: any, idx: number) => {
          const cellType = cell.cell_type || 'code';
          const source = Array.isArray(cell.source) ? cell.source.join('') : (cell.source || '');
          
          if (cellType === 'markdown') {
            lines.push(`\n<!-- Cell ${idx + 1}: Markdown -->\n${source}\n`);
          } else if (cellType === 'code') {
            lines.push(`\n\`\`\`python\n# Cell ${idx + 1}: Code\n${source}\n\`\`\`\n`);
            if (cell.outputs && Array.isArray(cell.outputs)) {
              cell.outputs.forEach((out: any) => {
                if (out.text) {
                  const outText = Array.isArray(out.text) ? out.text.join('') : out.text;
                  lines.push(`\`\`\`output\n${outText}\n\`\`\`\n`);
                }
              });
            }
          }
        });
        extractedText = lines.join('\n');
      } catch {
        extractedText = rawJson;
      }
    }
    // 2. Word Documents (.doc or .docx)
    else if (ext === 'doc' || ext === 'docx') {
      formatType = ext === 'doc' ? 'WORD DOC' : 'WORD DOCX';
      const rawText = await file.text();

      // Check if file is HTML-wrapped Word Document (common export format)
      const isHtmlWrapped = rawText.includes('<!DOCTYPE html') || 
                            rawText.includes('<html') || 
                            rawText.includes('xmlns:w=') || 
                            rawText.includes('<table');

      if (isHtmlWrapped) {
        formatType = `${ext.toUpperCase()} (HTML WORD EXPORT)`;
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawText, 'text/html');

        // Remove style & script blocks
        doc.querySelectorAll('style, script, meta, link').forEach(el => el.remove());

        // Convert <table> tags to Markdown Tables
        convertHtmlTablesToMarkdown(doc);

        extractedText = (doc.body.textContent || '')
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
      } else {
        // Native OOXML Binary .docx package
        const arrayBuffer = await file.arrayBuffer();
        const mammothResult = await mammoth.convertToHtml(
          { arrayBuffer },
          {
            convertImage: mammoth.images.imgElement((image) => {
              return image.read("base64").then((imageBuffer) => {
                const src = `data:${image.contentType};base64,${imageBuffer}`;
                embeddedImages.push(src);
                return { src };
              });
            })
          }
        );

        const parser = new DOMParser();
        const doc = parser.parseFromString(mammothResult.value, 'text/html');

        // Convert HTML tables into clean Markdown tables
        convertHtmlTablesToMarkdown(doc);

        extractedText = (doc.body.textContent || mammothResult.value)
          .replace(/\n\s*\n\s*\n/g, '\n\n')
          .trim();
      }
    }
    // 3. PDF Documents (.pdf)
    else if (ext === 'pdf') {
      formatType = 'PDF DOCUMENT';
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pdfTexts: string[] = [`# PDF: ${fileName} (${pdf.numPages} Pages)\n`];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map((item: any) => item.str || '').join(' ');

        if (pageStrings.trim().length > 10) {
          pdfTexts.push(`--- Page ${pageNum} ---\n${pageStrings}\n`);
        } else {
          // Offscreen HTML5 Canvas Rendering for Scanned PDF Page
          try {
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport, canvas } as any).promise;
              const pageImageDataUrl = canvas.toDataURL('image/png');
              embeddedImages.push(pageImageDataUrl);
              pdfTexts.push(`--- Page ${pageNum} (Scanned Image Page) ---\n[Scanned PDF Page image rendered to canvas for Vision AI Analysis]\n`);
            } else {
              pdfTexts.push(`--- Page ${pageNum} (Scanned Image Page) ---\n[Scanned PDF Page image ready for AI analysis]\n`);
            }
          } catch {
            pdfTexts.push(`--- Page ${pageNum} (Scanned Image Page) ---\n[Scanned PDF Page image ready for AI analysis]\n`);
          }
        }
      }
      extractedText = pdfTexts.join('\n');
    }
    // 4. Image Files (.png, .jpg, .jpeg, .webp)
    else if (file.type.startsWith('image/')) {
      formatType = 'IMAGE FILE';
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await base64Promise;
      embeddedImages.push(dataUrl);

      extractedText = `[Image File: ${fileName} (${sizeKb} KB)]\nImage data ready for AI Vision Analysis & OCR Extraction.`;
    }
    // 5. Code & Plain Text Files
    else {
      extractedText = await file.text();
    }
  } catch (err) {
    console.error('Unified File Extraction Error:', err);
    extractedText = `[Error extracting text from ${fileName}]: ${(err as Error).message}`;
  }

  const words = extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0;
  const chars = extractedText.length;

  return {
    fileName,
    fileSizeKb: sizeKb,
    formatType,
    wordCount: words,
    charCount: chars,
    extractedText,
    embeddedImages
  };
}
