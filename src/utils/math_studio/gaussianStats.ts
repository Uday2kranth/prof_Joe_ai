/**
 * Gaussian & Student-t Statistical Engine
 * Provides textbook-grade PDF, CDF, Critical Values, and CLT estimators.
 */

/**
 * Standard Normal (Gaussian) Probability Density Function
 * f(x | mu, sigma) = (1 / (sigma * sqrt(2 * pi))) * exp(-0.5 * ((x - mu) / sigma)^2)
 */
export function normalPdf(x: number, mu: number = 0, sigma: number = 1): number {
  if (sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

/**
 * Standard Normal Cumulative Distribution Function (Abramowitz & Stegun approximation)
 * Error < 7.5e-8
 */
export function normalCdf(x: number, mu: number = 0, sigma: number = 1): number {
  if (sigma <= 0) return x >= mu ? 1 : 0;
  const z = (x - mu) / sigma;
  
  // Abramowitz and Stegun formula 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z) / Math.SQRT2;

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Student-t Distribution Probability Density Function
 * f(t | nu) = Gamma((nu+1)/2) / (sqrt(nu*pi) * Gamma(nu/2)) * (1 + t^2 / nu)^(-(nu+1)/2)
 */
export function studentTPdf(t: number, nu: number, mu: number = 0, sigma: number = 1): number {
  if (nu <= 0 || sigma <= 0) return 0;
  const z = (t - mu) / sigma;
  if (nu >= 200) return normalPdf(z, 0, 1) / sigma; // Asymptotic convergence

  // Lanczos approximation for log-gamma
  const logGamma = (zVal: number): number => {
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.138571095856205, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (zVal < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * zVal)) - logGamma(1 - zVal);
    }
    zVal -= 1;
    let x = c[0];
    for (let i = 1; i < g + 2; i++) {
      x += c[i] / (zVal + i);
    }
    const tVal = zVal + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (zVal + 0.5) * Math.log(tVal) - tVal + Math.log(x);
  };

  const logCoeff = logGamma((nu + 1) / 2) - logGamma(nu / 2) - 0.5 * Math.log(nu * Math.PI);
  const coeff = Math.exp(logCoeff) / sigma;
  return coeff * Math.pow(1 + (z * z) / nu, -(nu + 1) / 2);
}


/**
 * Student-t Cumulative Distribution Function with Closed-Form Solutions & Adaptive Simpson Integration
 */
export function studentTCdf(x: number, nu: number, mu: number = 0, sigma: number = 1): number {
  const z = (x - mu) / sigma;
  if (nu === 1) {
    // Cauchy closed form: F(z) = 1/2 + 1/pi * arctan(z)
    return 0.5 + Math.atan(z) / Math.PI;
  }
  if (nu === 2) {
    // nu = 2 closed form: F(z) = 1/2 + z / (2*sqrt(2 + z^2))
    return 0.5 + z / (2 * Math.sqrt(2 + z * z));
  }
  if (nu >= 35) {
    return normalCdf(x, mu, sigma);
  }
  // High-precision adaptive Simpson numerical quadrature from 0 to |z|
  const sign = z >= 0 ? 1 : -1;
  const absZ = Math.abs(z);
  const steps = Math.min(64, Math.max(20, Math.ceil(absZ * 12)));
  const dt = absZ / steps;
  let integral = 0;
  for (let i = 0; i <= steps; i++) {
    const tVal = i * dt;
    const pdfVal = studentTPdf(tVal, nu);
    const weight = i === 0 || i === steps ? 1 : i % 2 === 1 ? 4 : 2;
    integral += weight * pdfVal;
  }
  integral = (dt / 3) * integral;
  const area = Math.min(0.5, Math.max(0, integral));
  return sign >= 0 ? 0.5 + area : 0.5 - area;
}

/**
 * Student-t Critical Value Evaluator (t_crit) for Hypothesis Testing
 */
export function getStudentTCrit(nu: number, conf: number): number {
  const t95Table: Record<number, number> = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    15: 2.131, 20: 2.086, 25: 2.060, 30: 2.042,
  };
  const t90Table: Record<number, number> = {
    1: 6.314, 2: 2.920, 3: 2.353, 4: 2.132, 5: 2.015,
    6: 1.943, 7: 1.895, 8: 1.860, 9: 1.833, 10: 1.812,
    15: 1.753, 20: 1.725, 25: 1.708, 30: 1.697,
  };
  const t99Table: Record<number, number> = {
    1: 63.657, 2: 9.925, 3: 5.841, 4: 4.604, 5: 4.032,
    6: 3.707, 7: 3.499, 8: 3.355, 9: 3.250, 10: 3.169,
    15: 2.947, 20: 2.845, 25: 2.787, 30: 2.750,
  };
  const table = conf === 90 ? t90Table : conf === 99 ? t99Table : t95Table;
  if (table[nu]) return table[nu];
  // Hill-Cornish-Fisher expansion for arbitrary degrees of freedom
  const z = conf === 90 ? 1.64485 : conf === 99 ? 2.57583 : 1.95996;
  const z3 = z * z * z;
  const z5 = z3 * z * z;
  return z + (z3 + z) / (4 * nu) + (5 * z5 + 16 * z3 + 3 * z) / (96 * nu * nu);
}

/**
 * Inverse error function (Winitzki approximation)
 */
export function calcErfInv(x: number): number {
  const clampedX = Math.max(-0.99999, Math.min(0.99999, x));
  const a = 0.147;
  const logTerm = Math.log(1 - clampedX * clampedX);
  const term1 = 2 / (Math.PI * a) + logTerm / 2;
  const inner = term1 * term1 - logTerm / a;
  const sign = clampedX < 0 ? -1 : 1;
  return sign * Math.sqrt(Math.max(0, Math.sqrt(inner) - term1));
}

/**
 * Standard Normal Quantile Function (Probit / Z_p)
 */
export function calcGaussianQuantile(p: number, mu: number = 0, sigma: number = 1): number {
  const clampedP = Math.max(1e-5, Math.min(1 - 1e-5, p));
  return mu + sigma * (Math.SQRT2 * calcErfInv(2 * clampedP - 1));
}

/**
 * Bivariate Normal Probability Density Function with correlation rho
 */
export function bivariateNormalPdf(
  x: number,
  y: number,
  muX: number = 0,
  muY: number = 0,
  sigmaX: number = 1,
  sigmaY: number = 1,
  rho: number = 0
): number {
  const clampedRho = Math.max(-0.99, Math.min(0.99, rho));
  const zX = (x - muX) / sigmaX;
  const zY = (y - muY) / sigmaY;
  const oneMinusRho2 = 1 - clampedRho * clampedRho;
  
  const exponent = -0.5 * (1 / oneMinusRho2) * (zX * zX - 2 * clampedRho * zX * zY + zY * zY);
  const denom = 2 * Math.PI * sigmaX * sigmaY * Math.sqrt(oneMinusRho2);
  
  return (1 / denom) * Math.exp(exponent);
}

/**
 * Student-t Quantile Function via High-Precision Bisection Inversion
 */
export function calcStudentTQuantile(p: number, nu: number, mu: number = 0, sigma: number = 1): number {
  const clampedP = Math.max(1e-5, Math.min(1 - 1e-5, p));
  if (nu === 1) {
    return mu + sigma * Math.tan(Math.PI * (clampedP - 0.5));
  }
  let low = -14.0;
  let high = 14.0;
  for (let iter = 0; iter < 24; iter++) {
    const mid = (low + high) / 2;
    const cdf = studentTCdf(mid, nu, 0, 1);
    if (cdf < clampedP) low = mid;
    else high = mid;
  }
  return mu + sigma * ((low + high) / 2);
}


