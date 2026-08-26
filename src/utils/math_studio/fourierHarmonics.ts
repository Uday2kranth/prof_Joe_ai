/**
 * Fourier Series Synthesis & 2D Linear Transformations Engine
 * Synthesizes harmonic waveforms (Square, Sawtooth, Triangle) and linear matrix basis mappings.
 */

export type WaveformType = 'square' | 'sawtooth' | 'triangle' | 'pulse';

export interface HarmonicComponent {
  k: number;
  frequency: number;
  amplitude: number;
  phase: number;
}

/**
 * Compute Fourier Series coefficients for standard periodic waveforms
 */
export function getFourierHarmonics(type: WaveformType, numHarmonics: number): HarmonicComponent[] {
  const harmonics: HarmonicComponent[] = [];

  for (let n = 1; n <= numHarmonics; n++) {
    let amplitude = 0;
    let frequency = 1;

    if (type === 'square') {
      // Odd harmonics only: b_k = 4 / (pi * (2n - 1))
      const k = 2 * n - 1;
      frequency = k;
      amplitude = 4 / (Math.PI * k);
      harmonics.push({ k, frequency, amplitude, phase: 0 });
    } else if (type === 'sawtooth') {
      // All harmonics: b_k = (2 / (pi * n)) * (-1)^(n+1)
      const k = n;
      frequency = k;
      amplitude = (2 / (Math.PI * k)) * (n % 2 === 1 ? 1 : -1);
      harmonics.push({ k, frequency, amplitude, phase: 0 });
    } else if (type === 'triangle') {
      // Odd harmonics: b_k = (8 / (pi^2 * k^2)) * (-1)^((k-1)/2)
      const k = 2 * n - 1;
      frequency = k;
      const sign = (n - 1) % 2 === 0 ? 1 : -1;
      amplitude = (8 / (Math.PI * Math.PI * k * k)) * sign;
      harmonics.push({ k, frequency, amplitude, phase: 0 });
    }
  }

  return harmonics;
}

/**
 * Evaluate Fourier Series waveform at time t
 */
export function evaluateFourierSeries(harmonics: HarmonicComponent[], t: number, fundamentalFreq: number = 1.0): number {
  let val = 0;
  for (const h of harmonics) {
    val += h.amplitude * Math.sin(h.frequency * fundamentalFreq * t + h.phase);
  }
  return val;
}

/**
 * 2D Linear Transformation Matrix multiplication
 * [x', y']^T = [[a, b], [c, d]] * [x, y]^T
 */
export function apply2DTransform(
  x: number,
  y: number,
  matrix: [[number, number], [number, number]]
): { x: number; y: number } {
  return {
    x: matrix[0][0] * x + matrix[0][1] * y,
    y: matrix[1][0] * x + matrix[1][1] * y
  };
}

/**
 * Compute Determinant (Area Scaling Factor) and Orientation of 2D Matrix
 */
export function compute2DMatrixDeterminant(matrix: [[number, number], [number, number]]): number {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
}
