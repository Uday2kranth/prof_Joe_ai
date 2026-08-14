import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Pre-processes Kroki SVG text nodes and dimensions for pixel-perfect PNG canvas export
 */
function fixSvgTextContrast(container: HTMLElement) {
  const svgs = container.querySelectorAll('svg');
  svgs.forEach((svg) => {
    svg.style.maxWidth = '100%';
    svg.style.maxHeight = 'none';
    svg.style.overflow = 'hidden';
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.width = '100%';
    svg.style.height = 'auto';

    const viewBox = svg.getAttribute('viewBox');
    if (!viewBox && !svg.getAttribute('width')) {
      svg.setAttribute('viewBox', '0 0 800 600');
    }
  });
}

/**
 * High-DPI Direct PNG Image Export Engine (Zero Lag, Direct On-Screen Capture)
 */
export async function exportBubbleToImage(
  bubbleElement: HTMLElement,
  filenamePrefix: string = 'chat-bubble',
  backgroundColor?: string
): Promise<void> {
  if (!bubbleElement) return;

  try {
    fixSvgTextContrast(bubbleElement);
    const computedBg = window.getComputedStyle(bubbleElement).backgroundColor;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = backgroundColor || ((computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') ? computedBg : (isLight ? '#ffffff' : '#0b0f19'));

    const canvas = await html2canvas(bubbleElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: bg,
      logging: false,
      ignoreElements: (element) => element.classList.contains('bubble-actions')
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filenamePrefix}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Image export failed:', err);
    alert('Failed to export image.');
  }
}

/**
 * High-DPI Paginated Multi-Page A4 PDF Export Engine (Direct Canvas Slicing, Zero Blank Pages)
 */
export async function exportBubbleToPdf(
  bubbleElement: HTMLElement,
  filenamePrefix: string = 'chat-document',
  backgroundColor?: string
): Promise<void> {
  if (!bubbleElement) return;

  try {
    fixSvgTextContrast(bubbleElement);
    const computedBg = window.getComputedStyle(bubbleElement).backgroundColor;
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = backgroundColor || ((computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') ? computedBg : (isLight ? '#ffffff' : '#0b0f19'));

    const canvas = await html2canvas(bubbleElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: bg,
      logging: false,
      ignoreElements: (element) => element.classList.contains('bubble-actions')
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const marginMm = 12;
    const contentWidthMm = pageWidthMm - (marginMm * 2); // 186 mm
    const contentHeightMm = pageHeightMm - (marginMm * 2); // 273 mm

    const pxPerMm = canvas.width / contentWidthMm;
    const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);
    const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const srcY = i * pageHeightPx;
      const srcHeight = Math.min(pageHeightPx, canvas.height - srcY);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = pageHeightPx;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, pageCanvas.width, pageHeightPx);
        ctx.drawImage(
          canvas,
          0, srcY, canvas.width, srcHeight,
          0, 0, canvas.width, srcHeight
        );
      }

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(pageImgData, 'JPEG', marginMm, marginMm, contentWidthMm, contentHeightMm);
    }

    pdf.save(`${filenamePrefix}-${Date.now()}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('Failed to export PDF.');
  }
}

