// Pure Client-Side Declarative Vector Chart Generator for Apache ECharts, Chart.js & ApexCharts
// Converts declarative JSON specs into standalone, high-contrast, glowing SVGs with zero backend dependencies.

export interface GenericChartDataset {
  label?: string;
  name?: string;
  data: any[];
  color?: string;
  borderColor?: string;
  backgroundColor?: string;
  type?: string;
}

export interface GenericChartSpec {
  title?: string;
  type?: 'scatter' | 'line' | 'bar' | 'doughnut' | 'pie' | 'heatmap' | 'boxplot' | 'radar' | 'area';
  xAxis?: {
    data?: string[];
    name?: string;
    min?: number;
    max?: number;
  };
  yAxis?: {
    name?: string;
    min?: number;
    max?: number;
  };
  series?: any[];
  data?: {
    labels?: string[];
    datasets?: GenericChartDataset[];
  };
  options?: any;
}

/**
 * Parses raw JSON / relaxed JSON from code blocks
 */
export function parseChartSpec(source: string): GenericChartSpec {
  const clean = source.trim();
  try {
    return JSON.parse(clean);
  } catch {
    try {
      const jsonish = clean
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"');
      return JSON.parse(jsonish);
    } catch {
      return { title: 'Chart Spec', series: [] };
    }
  }
}

/**
 * Renders an ECharts declarative JSON spec to SVG
 */
export function renderEChartsSvg(spec: any): string {
  const width = 640;
  const height = 380;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 55;
  const padBottom = 55;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const title = spec.title?.text || spec.title || 'Apache ECharts Visualizer';
  const series = spec.series || [];

  // Check if this is a Confusion Matrix / Heatmap
  if (spec.visualMap || series[0]?.type === 'heatmap' || spec.type === 'heatmap') {
    const xCategories = spec.xAxis?.data || ['Pred 0', 'Pred 1', 'Pred 2'];
    const yCategories = spec.yAxis?.data || ['Actual 0', 'Actual 1', 'Actual 2'];
    const matrixData: Array<[number, number, number]> = series[0]?.data || [
      [0, 0, 85], [0, 1, 10], [0, 2, 5],
      [1, 0, 8], [1, 1, 80], [1, 2, 12],
      [2, 0, 4], [2, 1, 6], [2, 2, 90]
    ];

    const cellW = plotWidth / xCategories.length;
    const cellH = plotHeight / yCategories.length;

    let cellsSvg = '';
    matrixData.forEach(([yIdx, xIdx, val]) => {
      const px = padLeft + xIdx * cellW;
      const py = padTop + yIdx * cellH;
      const opacity = Math.max(0.15, Math.min(0.95, val / 100));
      cellsSvg += `
        <rect x="${px + 2}" y="${py + 2}" width="${cellW - 4}" height="${cellH - 4}" rx="6" fill="#0284c7" fill-opacity="${opacity}" stroke="#38bdf8" stroke-width="1" />
        <text x="${px + cellW / 2}" y="${py + cellH / 2 + 5}" fill="#ffffff" font-size="14" font-family="'Inter', sans-serif" font-weight="700" text-anchor="middle">${val}</text>
      `;
    });

    let labelsSvg = '';
    xCategories.forEach((label: string, idx: number) => {
      labelsSvg += `<text x="${padLeft + idx * cellW + cellW / 2}" y="${padTop + plotHeight + 20}" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="middle">${label}</text>`;
    });
    yCategories.forEach((label: string, idx: number) => {
      labelsSvg += `<text x="${padLeft - 10}" y="${padTop + idx * cellH + cellH / 2 + 4}" fill="#94a3b8" font-size="11" font-weight="600" text-anchor="end">${label}</text>`;
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
        <rect width="${width}" height="${height}" rx="12" fill="#0b1329" stroke="#1e293b" stroke-width="1.5" />
        <g transform="translate(20, 32)">
          <rect x="0" y="-18" width="120" height="24" rx="12" fill="rgba(2, 132, 199, 0.15)" stroke="rgba(2, 132, 199, 0.3)" />
          <text x="10" y="-2" fill="#38bdf8" font-size="11" font-weight="700">📊 ECHARTS</text>
          <text x="135" y="-2" fill="#f8fafc" font-size="13" font-weight="600">${title}</text>
        </g>
        ${cellsSvg}
        ${labelsSvg}
      </svg>
    `;
  }

  // Default: Multi-Cluster Scatter Plot / Multi-Series ECharts
  const defaultColors = ['#38bdf8', '#10b981', '#f43f5e', '#fbbf24', '#a855f7'];
  let allPoints: Array<{ x: number; y: number; color: string; label?: string }> = [];

  series.forEach((s: any, sIdx: number) => {
    const sColor = s.itemStyle?.color || defaultColors[sIdx % defaultColors.length];
    if (Array.isArray(s.data)) {
      s.data.forEach((item: any) => {
        if (Array.isArray(item)) {
          allPoints.push({ x: item[0], y: item[1], color: sColor, label: s.name });
        } else if (typeof item === 'object' && item.value) {
          allPoints.push({ x: item.value[0], y: item.value[1], color: sColor, label: s.name });
        }
      });
    }
  });

  if (allPoints.length === 0) {
    allPoints = [
      { x: 1, y: 2, color: '#38bdf8', label: 'Cluster A' },
      { x: 2, y: 3, color: '#38bdf8', label: 'Cluster A' },
      { x: 6, y: 7, color: '#10b981', label: 'Cluster B' },
      { x: 7, y: 8, color: '#10b981', label: 'Cluster B' }
    ];
  }

  const xVals = allPoints.map(p => p.x);
  const yVals = allPoints.map(p => p.y);
  const xMin = Math.min(...xVals) - 1;
  const xMax = Math.max(...xVals) + 1;
  const yMin = Math.min(...yVals) - 1;
  const yMax = Math.max(...yVals) + 1;

  const mapX = (x: number) => padLeft + ((x - xMin) / (xMax - xMin || 1)) * plotWidth;
  const mapY = (y: number) => padTop + plotHeight - ((y - yMin) / (yMax - yMin || 1)) * plotHeight;

  let pointsSvg = '';
  allPoints.forEach(p => {
    const px = mapX(p.x);
    const py = mapY(p.y);
    pointsSvg += `<circle cx="${px}" cy="${py}" r="6" fill="${p.color}" stroke="#ffffff" stroke-width="1.5" />`;
  });

  // Series Legends
  let legendsSvg = '';
  let legOffset = width - 30;
  series.slice().reverse().forEach((s: any, sIdx: number) => {
    const sName = s.name || `Series ${sIdx + 1}`;
    const sColor = s.itemStyle?.color || defaultColors[sIdx % defaultColors.length];
    const tW = sName.length * 7;
    legOffset -= (tW + 24);
    legendsSvg += `
      <g transform="translate(${legOffset}, 32)">
        <circle cx="6" cy="-6" r="4" fill="${sColor}" />
        <text x="14" y="-2" fill="#cbd5e1" font-size="10" font-weight="600">${sName}</text>
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
      <rect width="${width}" height="${height}" rx="12" fill="#0b1329" stroke="#1e293b" stroke-width="1.5" />
      <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" rx="4" fill="#030712" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
      <g transform="translate(20, 32)">
        <rect x="0" y="-18" width="120" height="24" rx="12" fill="rgba(2, 132, 199, 0.15)" stroke="rgba(2, 132, 199, 0.3)" />
        <text x="10" y="-2" fill="#38bdf8" font-size="11" font-weight="700">📊 ECHARTS</text>
        <text x="135" y="-2" fill="#f8fafc" font-size="13" font-weight="600">${title}</text>
      </g>
      ${legendsSvg}
      ${pointsSvg}
    </svg>
  `;
}

/**
 * Renders a Chart.js declarative spec to SVG
 */
export function renderChartJsSvg(spec: any): string {
  const width = 640;
  const height = 380;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 55;
  const padBottom = 55;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const chartType = spec.type || 'line';
  const title = spec.options?.plugins?.title?.text || spec.title || 'Chart.js Visualizer';
  const data = spec.data || {};
  const labels = data.labels || [];
  const datasets = data.datasets || [];

  // Doughnut / Pie Chart
  if (chartType === 'doughnut' || chartType === 'pie') {
    const values: number[] = datasets[0]?.data || [40, 30, 20, 10];
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const colors = datasets[0]?.backgroundColor || ['#38bdf8', '#10b981', '#f43f5e', '#fbbf24'];

    const cx = width / 2;
    const cy = height / 2 + 10;
    const rOuter = 110;
    const rInner = chartType === 'doughnut' ? 65 : 0;

    let startAngle = 0;
    let slicesSvg = '';
    values.forEach((v, idx) => {
      const angle = (v / total) * 2 * Math.PI;
      const endAngle = startAngle + angle;
      const color = colors[idx % colors.length];

      const x1 = cx + rOuter * Math.cos(startAngle);
      const y1 = cy + rOuter * Math.sin(startAngle);
      const x2 = cx + rOuter * Math.cos(endAngle);
      const y2 = cy + rOuter * Math.sin(endAngle);

      const ix1 = cx + rInner * Math.cos(endAngle);
      const iy1 = cy + rInner * Math.sin(endAngle);
      const ix2 = cx + rInner * Math.cos(startAngle);
      const iy2 = cy + rInner * Math.sin(startAngle);

      const largeArc = angle > Math.PI ? 1 : 0;
      const d = `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${rInner} ${rInner} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;

      slicesSvg += `<path d="${d}" fill="${color}" stroke="#0f172a" stroke-width="2" />`;
      startAngle = endAngle;
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
        <rect width="${width}" height="${height}" rx="12" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
        <g transform="translate(20, 32)">
          <rect x="0" y="-18" width="115" height="24" rx="12" fill="rgba(244, 63, 94, 0.15)" stroke="rgba(244, 63, 94, 0.3)" />
          <text x="10" y="-2" fill="#f43f5e" font-size="11" font-weight="700">⚡ CHART.JS</text>
          <text x="130" y="-2" fill="#f8fafc" font-size="13" font-weight="600">${title}</text>
        </g>
        ${slicesSvg}
      </svg>
    `;
  }

  // 2. Continuous Line / Scatter / Multi-Series Metric Curves
  const defaultColors = ['#38bdf8', '#f43f5e', '#10b981', '#fbbf24', '#a855f7', '#06b6d4'];
  
  // Calculate dynamic X and Y bounding domains across all datasets
  let computedMinX = Infinity;
  let computedMaxX = -Infinity;
  let computedMinY = Infinity;
  let computedMaxY = -Infinity;
  let hasExplicitXY = false;

  datasets.forEach((ds: any) => {
    const pts = ds.data || [];
    pts.forEach((pt: any, idx: number) => {
      if (typeof pt === 'object' && pt !== null && ('x' in pt || 'y' in pt)) {
        hasExplicitXY = true;
        const x = pt.x !== undefined ? Number(pt.x) : idx;
        const y = pt.y !== undefined ? Number(pt.y) : 0;
        if (!isNaN(x)) {
          if (x < computedMinX) computedMinX = x;
          if (x > computedMaxX) computedMaxX = x;
        }
        if (!isNaN(y)) {
          if (y < computedMinY) computedMinY = y;
          if (y > computedMaxY) computedMaxY = y;
        }
      } else {
        const y = Number(pt);
        if (!isNaN(y)) {
          if (y < computedMinY) computedMinY = y;
          if (y > computedMaxY) computedMaxY = y;
        }
      }
    });
  });

  if (!hasExplicitXY) {
    computedMinX = 0;
    computedMaxX = Math.max(1, (labels ? labels.length - 1 : 10));
  }
  if (!isFinite(computedMinX)) computedMinX = 0;
  if (!isFinite(computedMaxX) || computedMaxX === computedMinX) computedMaxX = computedMinX + 10;
  if (!isFinite(computedMinY)) computedMinY = 0;
  if (!isFinite(computedMaxY) || computedMaxY === computedMinY) computedMaxY = computedMinY + 1;

  // Add 10% vertical padding
  const ySpanRaw = computedMaxY - computedMinY || 1;
  const minY = Math.floor((computedMinY - ySpanRaw * 0.08) * 100) / 100;
  const maxY = Math.ceil((computedMaxY + ySpanRaw * 0.12) * 100) / 100;
  const spanY = maxY - minY || 1;

  const minX = computedMinX;
  const maxX = computedMaxX;
  const spanX = maxX - minX || 1;

  const mapX = (xVal: number) => padLeft + ((xVal - minX) / spanX) * plotWidth;
  const mapY = (yVal: number) => padTop + plotHeight - ((yVal - minY) / spanY) * plotHeight;

  // Render Grid Lines & Axis Ticks
  let gridSvg = '';
  const numXTicks = 5;
  for (let i = 0; i <= numXTicks; i++) {
    const xVal = minX + (i / numXTicks) * spanX;
    const px = mapX(xVal);
    const labelText = labels && labels[i] ? labels[i] : Math.round(xVal * 10) / 10;
    gridSvg += `
      <line x1="${px}" y1="${padTop}" x2="${px}" y2="${padTop + plotHeight}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${px}" y="${padTop + plotHeight + 16}" fill="#94a3b8" font-size="10" font-family="'Inter', sans-serif" font-weight="500" text-anchor="middle">${labelText}</text>
    `;
  }

  const numYTicks = 5;
  for (let j = 0; j <= numYTicks; j++) {
    const yVal = minY + (j / numYTicks) * spanY;
    const py = mapY(yVal);
    gridSvg += `
      <line x1="${padLeft}" y1="${py}" x2="${padLeft + plotWidth}" y2="${py}" stroke="#1e293b" stroke-width="1" stroke-dasharray="3,3" />
      <text x="${padLeft - 10}" y="${py + 4}" fill="#94a3b8" font-size="10" font-family="'Inter', sans-serif" font-weight="500" text-anchor="end">${Math.round(yVal * 100) / 100}</text>
    `;
  }

  // Render Curves & Scatter Dots
  let pathsSvg = '';
  let legendSvg = '';
  let curLegX = 0;

  datasets.forEach((ds: any, dsIdx: number) => {
    const dsColor = ds.borderColor || ds.backgroundColor || defaultColors[dsIdx % defaultColors.length];
    const dsLabel = ds.label || `Series ${dsIdx + 1}`;
    const pts = ds.data || [];
    let pathD = '';

    pts.forEach((pt: any, pIdx: number) => {
      const xVal = typeof pt === 'object' && pt !== null && pt.x !== undefined ? Number(pt.x) : pIdx;
      const yVal = typeof pt === 'object' && pt !== null && pt.y !== undefined ? Number(pt.y) : Number(pt);
      const px = mapX(xVal);
      const py = mapY(yVal);

      if (pIdx === 0) pathD += `M ${px.toFixed(1)} ${py.toFixed(1)} `;
      else pathD += `L ${px.toFixed(1)} ${py.toFixed(1)} `;
    });

    pathsSvg += `
      <path d="${pathD}" fill="none" stroke="${dsColor}" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" />
    `;

    // Legend Pill
    const pillW = dsLabel.length * 6.8 + 26;
    legendSvg += `
      <g transform="translate(${padLeft + curLegX}, 50)">
        <rect x="-4" y="-12" width="${pillW}" height="17" rx="5" fill="rgba(15, 23, 42, 0.75)" stroke="rgba(255, 255, 255, 0.1)" />
        <line x1="2" y1="-4" x2="14" y2="-4" stroke="${dsColor}" stroke-width="2.5" />
        <text x="18" y="0" fill="#cbd5e1" font-size="9.5" font-family="'Inter', sans-serif" font-weight="600">${dsLabel}</text>
      </g>
    `;
    curLegX += pillW + 8;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
      <defs>
        <linearGradient id="chartjsBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="14" fill="url(#chartjsBg)" stroke="#1e293b" stroke-width="1.5" />
      <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" rx="4" fill="#020617" fill-opacity="0.75" stroke="#334155" stroke-width="1.2" />
      <g transform="translate(20, 26)">
        <rect x="0" y="-14" width="115" height="22" rx="11" fill="rgba(244, 63, 94, 0.15)" stroke="rgba(244, 63, 94, 0.3)" />
        <text x="10" y="1" fill="#f43f5e" font-size="10" font-family="'Inter', sans-serif" font-weight="700">⚡ CHART.JS</text>
        <text x="125" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
      </g>
      ${legendSvg}
      ${gridSvg}
      ${pathsSvg}
    </svg>
  `;
}

/**
 * Renders an ApexCharts declarative spec to SVG
 */
export function renderApexChartsSvg(spec: any): string {
  const width = 640;
  const height = 380;
  const padLeft = 65;
  const padRight = 35;
  const padTop = 55;
  const padBottom = 55;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const title = spec.title?.text || spec.title || 'ApexCharts Metric Suite';
  const series = spec.series || [{ name: 'Metric', data: [31, 40, 28, 51, 42, 109, 100] }];
  const categories = spec.xaxis?.categories || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  let curvesSvg = '';
  const colors = spec.colors || ['#00E396', '#008FFB', '#FEB019'];

  series.forEach((s: any, sIdx: number) => {
    const sColor = colors[sIdx % colors.length];
    const dataVals: number[] = s.data || [];
    const maxVal = Math.max(...dataVals, 100);
    const minVal = Math.min(...dataVals, 0);
    const span = maxVal - minVal || 1;

    let pathD = '';
    let areaD = `M ${padLeft} ${padTop + plotHeight} `;

    dataVals.forEach((val, idx) => {
      const px = padLeft + (idx / (dataVals.length - 1 || 1)) * plotWidth;
      const py = padTop + plotHeight - ((val - minVal) / span) * plotHeight;
      if (idx === 0) pathD += `M ${px} ${py} `;
      else pathD += `L ${px} ${py} `;
      areaD += `L ${px} ${py} `;
    });

    areaD += `L ${padLeft + plotWidth} ${padTop + plotHeight} Z`;

    curvesSvg += `
      <path d="${areaD}" fill="${sColor}" fill-opacity="0.18" />
      <path d="${pathD}" fill="none" stroke="${sColor}" stroke-width="3" stroke-linecap="round" />
    `;
  });

  let catSvg = '';
  if (categories && categories.length > 0) {
    categories.forEach((cat: string, idx: number) => {
      const px = padLeft + (idx / (categories.length - 1 || 1)) * plotWidth;
      catSvg += `<text x="${px}" y="${padTop + plotHeight + 18}" fill="#94a3b8" font-size="11" font-weight="500" text-anchor="middle">${cat}</text>`;
    });
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
      <defs>
        <linearGradient id="apexBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="12" fill="url(#apexBg)" stroke="#312e81" stroke-width="1.5" />
      <rect x="${padLeft}" y="${padTop}" width="${plotWidth}" height="${plotHeight}" rx="4" fill="#020617" fill-opacity="0.6" stroke="#334155" stroke-width="1" />
      <g transform="translate(20, 32)">
        <rect x="0" y="-18" width="130" height="24" rx="12" fill="rgba(0, 227, 150, 0.15)" stroke="rgba(0, 227, 150, 0.3)" />
        <text x="10" y="-2" fill="#00E396" font-size="11" font-weight="700">📈 APEXCHARTS</text>
        <text x="145" y="-2" fill="#f8fafc" font-size="13" font-weight="600">${title}</text>
      </g>
      ${curvesSvg}
      ${catSvg}
    </svg>
  `;
}

/**
 * Renders a Cytoscape Graph / Neural Network Layer Topology Spec to SVG
 */
export function renderCytoscapeSvg(spec: any): string {
  const width = 640;
  const height = 390;
  const title = spec.title || 'Cytoscape Network & Layer Topology';

  // Case 1: Layered Artificial Neural Network (ANN) Topology
  if (spec.layers && Array.isArray(spec.layers)) {
    const layers = spec.layers;
    const numLayers = layers.length;
    const padX = 70;
    const availableWidth = width - padX * 2;
    const colGap = numLayers > 1 ? availableWidth / (numLayers - 1) : availableWidth / 2;

    const layerPositions: Array<Array<{ x: number; y: number; label: string; color: string }>> = [];

    layers.forEach((layer: any, lIdx: number) => {
      const x = padX + lIdx * colGap;
      const nodes: string[] = layer.nodes || [`N${lIdx + 1}`];
      const numNodes = nodes.length;
      const startY = 85;
      const availableHeight = 250;
      const nodeGap = numNodes > 1 ? availableHeight / (numNodes - 1) : 0;
      const yOffset = numNodes === 1 ? availableHeight / 2 : 0;

      const layerNodes: Array<{ x: number; y: number; label: string; color: string }> = [];
      nodes.forEach((nodeName: string, nIdx: number) => {
        const y = startY + yOffset + nIdx * nodeGap;
        layerNodes.push({
          x,
          y,
          label: nodeName,
          color: layer.color || (lIdx === 0 ? '#38bdf8' : lIdx === numLayers - 1 ? '#f43f5e' : '#10b981')
        });
      });
      layerPositions.push(layerNodes);
    });

    // Generate inter-layer synaptic connection lines
    let connectionsSvg = '';
    for (let l = 0; l < layerPositions.length - 1; l++) {
      const fromLayer = layerPositions[l];
      const toLayer = layerPositions[l + 1];
      fromLayer.forEach(fromNode => {
        toLayer.forEach(toNode => {
          connectionsSvg += `
            <line x1="${fromNode.x}" y1="${fromNode.y}" x2="${toNode.x}" y2="${toNode.y}" stroke="rgba(148, 163, 184, 0.22)" stroke-width="1.2" />
          `;
        });
      });
    }

    // Generate nodes and layer label badges
    let nodesSvg = '';
    layerPositions.forEach((layerNodes, lIdx) => {
      const layerMeta = layers[lIdx];
      const headerX = layerNodes[0]?.x || padX;
      nodesSvg += `
        <text x="${headerX}" y="65" fill="#94a3b8" font-size="10.5" font-family="'Inter', sans-serif" font-weight="700" text-anchor="middle">${layerMeta.name || `Layer ${lIdx + 1}`}</text>
      `;

      layerNodes.forEach(node => {
        nodesSvg += `
          <circle cx="${node.x}" cy="${node.y}" r="15" fill="${node.color}" fill-opacity="0.22" stroke="${node.color}" stroke-width="2" filter="url(#cytoGlow)" />
          <circle cx="${node.x}" cy="${node.y}" r="6" fill="${node.color}" />
          <text x="${node.x}" y="${node.y + 24}" fill="#e2e8f0" font-size="9" font-family="'Inter', sans-serif" font-weight="600" text-anchor="middle">${node.label}</text>
        `;
      });
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
        <defs>
          <linearGradient id="cytoBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#020617" />
          </linearGradient>
          <filter id="cytoGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="${width}" height="${height}" rx="14" fill="url(#cytoBg)" stroke="#1e293b" stroke-width="1.5" />
        <g transform="translate(20, 26)">
          <rect x="0" y="-14" width="125" height="22" rx="11" fill="rgba(168, 85, 247, 0.18)" stroke="rgba(168, 85, 247, 0.35)" />
          <text x="10" y="1" fill="#c084fc" font-size="10" font-family="'Inter', sans-serif" font-weight="700">🧠 CYTOSCAPE ANN</text>
          <text x="135" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
        </g>
        ${connectionsSvg}
        ${nodesSvg}
      </svg>
    `;
  }

  // Case 2: Multi-Agent Collaboration Network / Graph Topology
  const nodes = spec.nodes || [
    { id: '1', label: 'Supervisor', color: '#a855f7', x: 320, y: 110 },
    { id: '2', label: 'Worker 1', color: '#38bdf8', x: 180, y: 240 },
    { id: '3', label: 'Worker 2', color: '#10b981', x: 320, y: 280 },
    { id: '4', label: 'Critic', color: '#f43f5e', x: 460, y: 240 }
  ];

  const edges = spec.edges || [
    { source: '1', target: '2', label: 'Dispatch' },
    { source: '1', target: '3', label: 'Dispatch' },
    { source: '2', target: '4', label: 'Draft' },
    { source: '3', target: '4', label: 'Draft' },
    { source: '4', target: '1', label: 'Feedback' }
  ];

  const nodeMap = new Map<string, { x: number; y: number; label: string; color: string }>();
  nodes.forEach((n: any) => {
    nodeMap.set(n.id || n.name, {
      x: n.x || 320,
      y: n.y || 200,
      label: n.label || n.name || n.id,
      color: n.color || '#38bdf8'
    });
  });

  let edgesSvg = '';
  edges.forEach((e: any) => {
    const src = nodeMap.get(e.source || e.from);
    const tgt = nodeMap.get(e.target || e.to);
    if (src && tgt) {
      const midX = (src.x + tgt.x) / 2;
      const midY = (src.y + tgt.y) / 2;
      edgesSvg += `
        <line x1="${src.x}" y1="${src.y}" x2="${tgt.x}" y2="${tgt.y}" stroke="rgba(56, 189, 248, 0.4)" stroke-width="2" stroke-dasharray="4,3" />
        ${e.label ? `<text x="${midX}" y="${midY - 5}" fill="#94a3b8" font-size="9" font-weight="600" text-anchor="middle" background="rgba(15,23,42,0.8)">${e.label}</text>` : ''}
      `;
    }
  });

  let nodesSvg = '';
  nodes.forEach((n: any) => {
    const pt = nodeMap.get(n.id || n.name);
    if (pt) {
      nodesSvg += `
        <circle cx="${pt.x}" cy="${pt.y}" r="22" fill="${pt.color}" fill-opacity="0.22" stroke="${pt.color}" stroke-width="2.5" />
        <circle cx="${pt.x}" cy="${pt.y}" r="7" fill="${pt.color}" />
        <text x="${pt.x}" y="${pt.y + 35}" fill="#f8fafc" font-size="10.5" font-family="'Inter', sans-serif" font-weight="600" text-anchor="middle">${pt.label}</text>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
      <defs>
        <linearGradient id="cytoNetBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#020617" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" rx="14" fill="url(#cytoNetBg)" stroke="#1e293b" stroke-width="1.5" />
      <g transform="translate(20, 26)">
        <rect x="0" y="-14" width="130" height="22" rx="11" fill="rgba(6, 182, 212, 0.15)" stroke="rgba(6, 182, 212, 0.3)" />
        <text x="10" y="1" fill="#38bdf8" font-size="10" font-family="'Inter', sans-serif" font-weight="700">🌐 NETWORK GRAPH</text>
        <text x="140" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
      </g>
      ${edgesSvg}
      ${nodesSvg}
    </svg>
  `;
}

/**
 * Renders Computer Vision Matrix, Convolution Kernel, and Bounding Box SVGs
 */
export function renderMatrixSvg(spec: any): string {
  const width = 640;
  const height = 390;
  const title = spec.title || 'Mathematical Matrix Visualizer';

  // Subtype 1: 2D Convolution Operation (Image Matrix + Kernel -> Feature Map)
  if (spec.type === 'convolution' || spec.kernelMatrix) {
    const inputMatrix = spec.inputMatrix || [
      [1, 1, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 1, 1],
      [0, 0, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ];
    const kernelMatrix = spec.kernelMatrix || [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1]
    ];
    const outputMatrix = spec.outputMatrix || [
      [4, 3, 4],
      [2, 4, 3],
      [2, 3, 4]
    ];

    const cellSize = 26;
    let inputSvg = '';
    inputMatrix.forEach((row: number[], rIdx: number) => {
      row.forEach((val: number, cIdx: number) => {
        const x = 40 + cIdx * cellSize;
        const y = 80 + rIdx * cellSize;
        const isHighlight = rIdx < 3 && cIdx < 3;
        const fill = isHighlight ? 'rgba(56, 189, 248, 0.3)' : 'rgba(30, 41, 59, 0.6)';
        const stroke = isHighlight ? '#38bdf8' : '#334155';
        inputSvg += `
          <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" />
          <text x="${x + cellSize / 2}" y="${y + 17}" fill="#f8fafc" font-size="11" font-weight="600" text-anchor="middle">${val}</text>
        `;
      });
    });

    let kernelSvg = '';
    kernelMatrix.forEach((row: number[], rIdx: number) => {
      row.forEach((val: number, cIdx: number) => {
        const x = 230 + cIdx * cellSize;
        const y = 106 + rIdx * cellSize;
        kernelSvg += `
          <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="rgba(244, 63, 94, 0.25)" stroke="#f43f5e" stroke-width="1.2" />
          <text x="${x + cellSize / 2}" y="${y + 17}" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">${val}</text>
        `;
      });
    });

    let outputSvg = '';
    outputMatrix.forEach((row: number[], rIdx: number) => {
      row.forEach((val: number, cIdx: number) => {
        const x = 410 + cIdx * (cellSize + 4);
        const y = 106 + rIdx * (cellSize + 4);
        const isTarget = rIdx === 0 && cIdx === 0;
        const fill = isTarget ? 'rgba(16, 185, 129, 0.45)' : 'rgba(15, 23, 42, 0.7)';
        const stroke = isTarget ? '#10b981' : '#475569';
        outputSvg += `
          <rect x="${x}" y="${y}" width="${cellSize + 4}" height="${cellSize + 4}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="1.5" />
          <text x="${x + (cellSize + 4) / 2}" y="${y + 20}" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">${val}</text>
        `;
      });
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
        <rect width="${width}" height="${height}" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1.5" />
        <g transform="translate(20, 26)">
          <rect x="0" y="-14" width="130" height="22" rx="11" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.3)" />
          <text x="10" y="1" fill="#38bdf8" font-size="10" font-family="'Inter', sans-serif" font-weight="700">📸 2D CONVOLUTION</text>
          <text x="140" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
        </g>
        <text x="105" y="66" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">Input Feature Map (5x5)</text>
        ${inputSvg}
        <text x="195" y="150" fill="#94a3b8" font-size="20" font-weight="700" text-anchor="middle">✱</text>
        <text x="270" y="92" fill="#f43f5e" font-size="11" font-weight="700" text-anchor="middle">Kernel (3x3)</text>
        ${kernelSvg}
        <text x="355" y="150" fill="#94a3b8" font-size="20" font-weight="700" text-anchor="middle">=</text>
        <text x="455" y="92" fill="#10b981" font-size="11" font-weight="700" text-anchor="middle">Output Activation (3x3)</text>
        ${outputSvg}
        <g transform="translate(40, 245)">
          <rect x="0" y="0" width="560" height="95" rx="8" fill="rgba(15, 23, 42, 0.75)" stroke="#334155" stroke-width="1" />
          <text x="16" y="24" fill="#38bdf8" font-size="11" font-weight="700">💡 Step-by-Step Dot Product Formula:</text>
          <text x="16" y="48" fill="#e2e8f0" font-size="10.5" font-family="monospace">Output(0,0) = (1·1 + 1·0 + 1·1) + (0·0 + 1·1 + 1·0) + (0·1 + 0·0 + 1·1) = 4</text>
          <text x="16" y="72" fill="#94a3b8" font-size="10.5">Feature map size = ⌊(W - K + 2P)/S⌋ + 1 = ⌊(5 - 3 + 0)/1⌋ + 1 = 3x3</text>
        </g>
      </svg>
    `;
  }

  // Subtype 2: Object Detection Bounding Boxes & Segmentation
  if (spec.type === 'bounding_box' || spec.boxes) {
    const boxes = spec.boxes || [
      { label: 'Autonomous Vehicle (98.4%)', x: 60, y: 80, width: 240, height: 160, color: '#38bdf8' },
      { label: 'Pedestrian (92.1%)', x: 340, y: 90, width: 110, height: 180, color: '#10b981' },
      { label: 'Traffic Light (96.5%)', x: 490, y: 50, width: 80, height: 130, color: '#f43f5e' }
    ];

    let boxesSvg = '';
    boxes.forEach((b: any) => {
      const bColor = b.color || '#38bdf8';
      boxesSvg += `
        <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" fill="${bColor}" fill-opacity="0.15" stroke="${bColor}" stroke-width="2.5" stroke-dasharray="4,2" />
        <rect x="${b.x}" y="${b.y - 20}" width="${(b.label || '').length * 7 + 16}" height="20" fill="${bColor}" rx="3" />
        <text x="${b.x + 8}" y="${b.y - 6}" fill="#020617" font-size="10" font-family="'Inter', sans-serif" font-weight="700">${b.label}</text>
      `;
    });

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
        <rect width="${width}" height="${height}" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1.5" />
        <g transform="translate(20, 26)">
          <rect x="0" y="-14" width="130" height="22" rx="11" fill="rgba(16, 185, 129, 0.18)" stroke="rgba(16, 185, 129, 0.35)" />
          <text x="10" y="1" fill="#34d399" font-size="10" font-family="'Inter', sans-serif" font-weight="700">🎯 OBJECT DETECTION</text>
          <text x="140" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
        </g>
        <rect x="40" y="45" width="560" height="310" rx="8" fill="rgba(15, 23, 42, 0.6)" stroke="#334155" stroke-width="1" />
        ${boxesSvg}
      </svg>
    `;
  }

  // Subtype 3: AI ⊃ ML ⊃ Deep Learning Set Containment Venn Diagram
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" class="function-plot-svg">
      <rect width="${width}" height="${height}" rx="14" fill="#090d16" stroke="#1e293b" stroke-width="1.5" />
      <g transform="translate(20, 26)">
        <rect x="0" y="-14" width="135" height="22" rx="11" fill="rgba(56, 189, 248, 0.15)" stroke="rgba(56, 189, 248, 0.3)" />
        <text x="10" y="1" fill="#38bdf8" font-size="10" font-family="'Inter', sans-serif" font-weight="700">⭕ VENN HIERARCHY</text>
        <text x="145" y="1" fill="#f8fafc" font-size="12.5" font-family="'Inter', sans-serif" font-weight="600">${title}</text>
      </g>
      <!-- Outer: Artificial Intelligence -->
      <ellipse cx="320" cy="225" rx="275" ry="135" fill="rgba(56, 189, 248, 0.08)" stroke="#38bdf8" stroke-width="2" />
      <text x="320" y="112" fill="#38bdf8" font-size="13" font-weight="700" text-anchor="middle">ARTIFICIAL INTELLIGENCE (AI)</text>
      <text x="320" y="128" fill="#94a3b8" font-size="10" text-anchor="middle">Machines simulating human intelligence, reasoning & problem-solving</text>

      <!-- Middle: Machine Learning -->
      <ellipse cx="320" cy="250" rx="195" ry="95" fill="rgba(168, 85, 247, 0.14)" stroke="#a855f7" stroke-width="2" />
      <text x="320" y="172" fill="#c084fc" font-size="12" font-weight="700" text-anchor="middle">MACHINE LEARNING (ML)</text>
      <text x="320" y="188" fill="#cbd5e1" font-size="9.5" text-anchor="middle">Statistical algorithms that learn representations directly from data</text>

      <!-- Inner: Deep Learning -->
      <ellipse cx="320" cy="280" rx="115" ry="55" fill="rgba(16, 185, 129, 0.24)" stroke="#10b981" stroke-width="2" />
      <text x="320" y="248" fill="#34d399" font-size="11.5" font-weight="700" text-anchor="middle">DEEP LEARNING (DL)</text>
      <text x="320" y="264" fill="#f8fafc" font-size="9" text-anchor="middle">Multi-layer Artificial Neural</text>
      <text x="320" y="277" fill="#f8fafc" font-size="9" text-anchor="middle">Networks & Feature Hierarchies</text>
    </svg>
  `;
}
