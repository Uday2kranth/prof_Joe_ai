import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

/**
 * Pre-processes Kroki SVG text nodes to hardcode high-contrast dark fill (#0f172a) on light node boxes
 */
function fixSvgTextContrast(container: HTMLElement) {
  const svgs = container.querySelectorAll('svg');
  svgs.forEach((svg) => {
    svg.style.maxWidth = 'none';
    svg.style.maxHeight = 'none';
    svg.style.overflow = 'visible';
    svg.style.display = 'block';

    const viewBox = svg.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        svg.setAttribute('width', `${parts[2]}px`);
        svg.setAttribute('height', `${parts[3]}px`);
      }
    }

    // Force SVG text elements to have explicit fill color so canvas rasterizer doesn't render white-on-white text
    const textNodes = svg.querySelectorAll('text, tspan');
    textNodes.forEach((t) => {
      const currentFill = t.getAttribute('fill') || getComputedStyle(t).fill;
      // If current fill is white/light or unset, override with dark color for light background nodes
      if (!currentFill || currentFill === 'rgb(255, 255, 255)' || currentFill === '#ffffff' || currentFill === 'white' || currentFill === 'none') {
        t.setAttribute('fill', '#0f172a');
        (t as HTMLElement).style.fill = '#0f172a';
      }
    });
  });
}

/**
 * Creates a painted offscreen clone container for unconstrained rendering
 */
function createOffscreenClone(bubbleElement: HTMLElement): HTMLElement {
  const cloneWrapper = document.createElement('div');
  cloneWrapper.style.position = 'fixed';
  cloneWrapper.style.left = '0';
  cloneWrapper.style.top = '0';
  cloneWrapper.style.zIndex = '-9999';
  cloneWrapper.style.opacity = '0.99';
  cloneWrapper.style.pointerEvents = 'none';
  cloneWrapper.style.width = '800px'; // Standard container width
  cloneWrapper.style.maxWidth = 'none';
  cloneWrapper.style.height = 'auto';
  cloneWrapper.style.maxHeight = 'none';
  cloneWrapper.style.overflow = 'visible';

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const bgColor = isLight ? '#ffffff' : '#0b0f19';
  const textColor = isLight ? '#0f172a' : '#f8fafc';

  cloneWrapper.style.background = bgColor;
  cloneWrapper.style.color = textColor;
  cloneWrapper.style.padding = '32px';
  cloneWrapper.style.borderRadius = '16px';
  cloneWrapper.style.boxSizing = 'border-box';

  const clone = bubbleElement.cloneNode(true) as HTMLElement;
  clone.style.maxWidth = 'none';
  clone.style.width = '100%';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.boxShadow = 'none';
  clone.style.transform = 'none';
  clone.style.background = bgColor;
  clone.style.color = textColor;

  fixSvgTextContrast(clone);

  const diagramContainers = clone.querySelectorAll<HTMLElement>('.kroki-container');
  diagramContainers.forEach((container) => {
    container.style.maxWidth = 'none';
    container.style.maxHeight = 'none';
    container.style.overflow = 'visible';
    container.style.width = 'auto';
    container.style.background = isLight ? '#f8fafc' : '#090d16';
  });

  cloneWrapper.appendChild(clone);
  document.body.appendChild(cloneWrapper);
  return cloneWrapper;
}

/**
 * High-DPI Offscreen PNG Image Export Engine
 */
export async function exportBubbleToImage(bubbleElement: HTMLElement, filenamePrefix: string = 'chat-bubble'): Promise<void> {
  if (!bubbleElement) return;
  const cloneWrapper = createOffscreenClone(bubbleElement);

  try {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLight ? '#ffffff' : '#0b0f19';

    const dataUrl = await toPng(cloneWrapper, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: bgColor,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('bubble-actions')) {
          return false;
        }
        return true;
      }
    });

    const link = document.createElement('a');
    link.download = `${filenamePrefix}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Image export failed:', err);
    alert('Failed to export image.');
  } finally {
    if (document.body.contains(cloneWrapper)) {
      document.body.removeChild(cloneWrapper);
    }
  }
}

/**
 * High-DPI Paginated Multi-Page A4 PDF Export Engine
 */
export async function exportBubbleToPdf(bubbleElement: HTMLElement, filenamePrefix: string = 'chat-document'): Promise<void> {
  if (!bubbleElement) return;
  const cloneWrapper = createOffscreenClone(bubbleElement);

  try {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const bgColor = isLight ? '#ffffff' : '#0b0f19';

    const dataUrl = await toPng(cloneWrapper, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: bgColor,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList.contains('bubble-actions')) {
          return false;
        }
        return true;
      }
    });

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvasWidth = img.width;
    const canvasHeight = img.height;

    // Standard A4 Dimensions in points (72 DPI): 595.28 x 841.89 pt
    const a4Width = 595.28;
    const a4Height = 841.89;

    // Calculate scaled height on A4 page
    const imgPdfHeight = (canvasHeight * a4Width) / canvasWidth;

    const pdf = new jsPDF('p', 'pt', 'a4');
    let heightLeft = imgPdfHeight;
    let position = 0;

    // First page
    pdf.addImage(dataUrl, 'PNG', 0, position, a4Width, imgPdfHeight);
    heightLeft -= a4Height;

    // Add extra pages if content exceeds single A4 page height
    while (heightLeft > 0) {
      position = heightLeft - imgPdfHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, 'PNG', 0, position, a4Width, imgPdfHeight);
      heightLeft -= a4Height;
    }

    pdf.save(`${filenamePrefix}-${Date.now()}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('Failed to export PDF.');
  } finally {
    if (document.body.contains(cloneWrapper)) {
      document.body.removeChild(cloneWrapper);
    }
  }
}
