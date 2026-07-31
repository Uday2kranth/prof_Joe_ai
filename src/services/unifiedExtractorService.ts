import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// ─── PDF.js Worker Configuration ───
// Use /pdf.worker.js (with .js extension) to guarantee servers return 
// Content-Type: text/javascript instead of text/html on legacy/custom servers.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js';

async function loadPdfDocument(uint8Array: Uint8Array): Promise<pdfjsLib.PDFDocumentProxy> {
  try {
    const task = pdfjsLib.getDocument({ data: uint8Array });
    return await task.promise;
  } catch (err) {
    console.warn('PDF Loader (Local worker) failed, attempting Main Thread fallback:', err);
    // Disable worker completely → Run 100% in-memory on main thread
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
    const fallbackTask = pdfjsLib.getDocument({ data: uint8Array, disableWorker: true } as any);
    return await fallbackTask.promise;
  }
}

export interface ExtractedResult {
  fileName: string;
  fileSizeKb: number;
  formatType: string;
  wordCount: number;
  charCount: number;
  extractedText: string;
  embeddedImages: string[]; // Array of Base64 image data URLs
}

// ─── Canvas Preprocessing Helper (Grayscale + Binarisation) ───
// Improves Tesseract OCR accuracy on noisy / low-contrast images.
// Pipeline: Upscale small images → Grayscale → Contrast stretch → Binarise
function preprocessCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  let w = sourceCanvas.width;
  let h = sourceCanvas.height;

  // ── Step 1: Upscale small images (< 1000px wide) for better OCR ──
  // Tesseract works best with ~300 DPI equivalent; upscale small sources.
  const MIN_OCR_WIDTH = 1000;
  let scale = 1;
  if (w < MIN_OCR_WIDTH) {
    scale = Math.min(MIN_OCR_WIDTH / w, 3); // Cap at 3x to avoid huge canvases
  }
  const scaledW = Math.round(w * scale);
  const scaledH = Math.round(h * scale);

  const out = document.createElement('canvas');
  out.width = scaledW;
  out.height = scaledH;
  const ctx = out.getContext('2d')!;

  // Use high-quality interpolation for upscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(sourceCanvas, 0, 0, scaledW, scaledH);

  // ── Step 2: Grayscale + Contrast Stretch + Binarisation ──
  const imageData = ctx.getImageData(0, 0, scaledW, scaledH);
  const data = imageData.data;

  // First pass: find min/max gray values for contrast stretching
  let minGray = 255;
  let maxGray = 0;
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (gray < minGray) minGray = gray;
    if (gray > maxGray) maxGray = gray;
  }

  // Second pass: contrast stretch to full 0-255 range, then binarise
  const range = maxGray - minGray || 1; // Avoid division by zero
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    // Stretch contrast to full 0-255 range
    const stretched = ((gray - minGray) / range) * 255;
    // Adaptive binarisation threshold at midpoint
    const bin = stretched > 128 ? 255 : 0;
    data[i] = bin;
    data[i + 1] = bin;
    data[i + 2] = bin;
  }

  ctx.putImageData(imageData, 0, 0);
  return out;
}

// ─── Tesseract OCR Wrapper ───
// Accepts either a canvas element or a base64 data URL string.
// Returns recognised text or empty string on failure.
async function ocrFromSource(source: HTMLCanvasElement | string): Promise<string> {
  try {
    let input: string;
    if (typeof source === 'string') {
      // base64 data URL – load into an image, draw onto canvas, preprocess
      const img = await loadImage(source);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const processed = preprocessCanvas(canvas);
      input = processed.toDataURL('image/png');
    } else {
      // HTMLCanvasElement – preprocess directly
      const processed = preprocessCanvas(source);
      input = processed.toDataURL('image/png');
    }

    const result = await Tesseract.recognize(input, 'eng', {
      logger: (_m: any) => {
        // Silent – no console spam
      }
    });

    return (result.data.text || '').trim();
  } catch (err) {
    console.warn('Tesseract OCR failed:', err);
    return '';
  }
}

// ─── Image Loader Utility ───
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
 *
 * Decision flow:
 *   .ipynb        → JSON parse cells
 *   .doc/.docx    → HTML check → mammoth or DOMParser
 *   .pdf          → pdfjs getDocument()
 *       page has text (>10 chars) → getTextContent() directly
 *       page has no text (scanned) → render to canvas → preprocess → Tesseract OCR
 *   image/*       → load to canvas → preprocess → Tesseract OCR
 *   other         → file.text() (plain text)
 */
export async function extractFileContent(file: File): Promise<ExtractedResult> {
  const sizeKb = Math.round(file.size / 1024);
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  let extractedText = '';
  let formatType = ext.toUpperCase();
  const embeddedImages: string[] = [];

  try {
    // ── 1. Jupyter Notebook (.ipynb) ──
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
    // ── 2. Word Documents (.doc or .docx) ──
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
    // ── 3. PDF Documents (.pdf) ──
    else if (ext === 'pdf') {
      formatType = 'PDF DOCUMENT';
      const arrayBuffer = await file.arrayBuffer();
      // pdfjs-dist v6 prefers Uint8Array over raw ArrayBuffer
      const uint8Array = new Uint8Array(arrayBuffer);
      // Use local /pdf.worker.mjs with Main Thread fallback
      const pdf = await loadPdfDocument(uint8Array);
      const pdfTexts: string[] = [`# PDF: ${fileName} (${pdf.numPages} Pages)\n`];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items.map((item: any) => item.str || '').join(' ');

        if (pageStrings.trim().length > 10) {
          // ─ Normal text page (HTML-to-PDF, digital PDF, etc.) ─
          pdfTexts.push(`--- Page ${pageNum} ---\n${pageStrings}\n`);
        } else {
          // ─ Scanned / image-only page → Canvas render → OCR ─
          try {
            const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
            const canvas = document.createElement('canvas');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            const ctx = canvas.getContext('2d')!;

            // pdfjs-dist v6 requires `canvas` in RenderParameters
            await page.render({ canvas, canvasContext: ctx, viewport } as any).promise;

            // Store the page image
            const pageImageDataUrl = canvas.toDataURL('image/png');
            embeddedImages.push(pageImageDataUrl);

            // Run Tesseract OCR on the rendered canvas
            const ocrText = await ocrFromSource(canvas);

            if (ocrText.length > 10) {
              pdfTexts.push(`--- Page ${pageNum} (OCR Extracted) ---\n${ocrText}\n`);
            } else {
              pdfTexts.push(`--- Page ${pageNum} (Scanned Image Page) ---\n[Scanned PDF Page — OCR found minimal text. Image stored for AI analysis.]\n`);
            }
          } catch (renderErr) {
            console.warn(`PDF page ${pageNum} canvas render failed:`, renderErr);
            pdfTexts.push(`--- Page ${pageNum} (Scanned Image Page) ---\n[Scanned PDF Page — canvas render unavailable, image ready for AI analysis]\n`);
          }
        }
      }
      extractedText = pdfTexts.join('\n');
    }
    // ── 4. Image Files (.png, .jpg, .jpeg, .webp) ──
    else if (file.type.startsWith('image/')) {
      formatType = 'IMAGE FILE';
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const dataUrl = await base64Promise;
      embeddedImages.push(dataUrl);

      // Run Canvas preprocessing + Tesseract OCR on the image
      const ocrText = await ocrFromSource(dataUrl);

      if (ocrText.length > 10) {
        formatType = 'IMAGE FILE (OCR)';
        extractedText = `# OCR Extracted from: ${fileName}\n\n${ocrText}`;
      } else {
        extractedText = `[Image File: ${fileName} (${sizeKb} KB)]\nImage data ready for AI Vision Analysis.\n(OCR found minimal readable text in this image)`;
      }
    }
    // ── 5. Code & Plain Text Files ──
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
