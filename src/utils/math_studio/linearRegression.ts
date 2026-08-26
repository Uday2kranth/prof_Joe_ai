/**
 * Linear Regression & Ordinary Least Squares (OLS) Mathematical Engine
 * Computes exact closed-form slope, intercept, R-squared, Pearson correlation, and Gradient Descent steps.
 */

export interface RegDataPoint {
  x: number;
  y: number;
}

export interface OLSResult {
  slope: number;
  intercept: number;
  r2: number;
  pearsonR: number;
  rss: number;
  tss: number;
}

/**
 * Closed-Form Ordinary Least Squares (Normal Equations) for 1D
 * slope m = sum((x - x_bar)(y - y_bar)) / sum((x - x_bar)^2)
 * intercept b = y_bar - m * x_bar
 */
export function computeOLS(points: RegDataPoint[]): OLSResult {
  const n = points.length;
  if (n === 0) {
    return { slope: 0, intercept: 0, r2: 0, pearsonR: 0, rss: 0, tss: 0 };
  }
  if (n === 1) {
    return { slope: 0, intercept: points[0].y, r2: 1, pearsonR: 0, rss: 0, tss: 0 };
  }

  let sumX = 0, sumY = 0;
  for (const pt of points) {
    sumX += pt.x;
    sumY += pt.y;
  }
  const meanX = sumX / n;
  const meanY = sumY / n;

  let num = 0;
  let den = 0;
  let tss = 0;

  for (const pt of points) {
    const dx = pt.x - meanX;
    const dy = pt.y - meanY;
    num += dx * dy;
    den += dx * dx;
    tss += dy * dy;
  }

  // Prevent divide by zero if all x coordinates are identical
  const slope = den !== 0 ? num / den : 0;
  const intercept = meanY - slope * meanX;

  let rss = 0;
  for (const pt of points) {
    const pred = slope * pt.x + intercept;
    const err = pt.y - pred;
    rss += err * err;
  }

  const r2 = tss > 0 ? Math.max(0, 1 - rss / tss) : 1;
  const pearsonR = (den > 0 && tss > 0) ? num / Math.sqrt(den * tss) : 0;

  return { slope, intercept, r2, pearsonR, rss, tss };
}

/**
 * 1-Step Batch Gradient Descent Update for Linear Regression J(m, b) = 1/2N sum(mx + b - y)^2
 */
export function gradientDescentStep(
  points: RegDataPoint[],
  currentSlope: number,
  currentIntercept: number,
  learningRate: number
): { newSlope: number; newIntercept: number; gradSlope: number; gradIntercept: number; cost: number } {
  const n = points.length;
  if (n === 0) {
    return { newSlope: currentSlope, newIntercept: currentIntercept, gradSlope: 0, gradIntercept: 0, cost: 0 };
  }

  let gradSlope = 0;
  let gradIntercept = 0;
  let totalCost = 0;

  for (const pt of points) {
    const pred = currentSlope * pt.x + currentIntercept;
    const err = pred - pt.y;
    gradSlope += err * pt.x;
    gradIntercept += err;
    totalCost += err * err;
  }

  gradSlope /= n;
  gradIntercept /= n;
  const cost = totalCost / (2 * n);

  const newSlope = currentSlope - learningRate * gradSlope;
  const newIntercept = currentIntercept - learningRate * gradIntercept;

  return { newSlope, newIntercept, gradSlope, gradIntercept, cost };
}
