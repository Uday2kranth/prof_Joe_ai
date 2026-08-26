/**
 * Support Vector Regressor (SVR) Mathematical Engine
 * Implements epsilon-insensitive loss tube, slack variables, and support vector bounds.
 */

export interface RegressionPoint {
  id: number;
  x: number;
  y: number;
}

/**
 * Epsilon-Insensitive Loss Function
 * L_eps(y, yHat) = max(0, |y - yHat| - eps)
 */
export function epsilonLoss(y: number, yHat: number, epsilon: number): number {
  return Math.max(0, Math.abs(y - yHat) - epsilon);
}

/**
 * Calculate Upper Slack (xi) and Lower Slack (xi*) for SVR
 */
export function calculateSvrSlacks(
  y: number,
  yHat: number,
  epsilon: number
): { xi: number; xiStar: number; isSupportVector: boolean } {
  const diff = y - yHat;
  const xi = Math.max(0, diff - epsilon);       // Point above upper tube
  const xiStar = Math.max(0, -diff - epsilon);  // Point below lower tube
  const isSupportVector = Math.abs(diff) >= epsilon - 0.05;

  return { xi, xiStar, isSupportVector };
}

/**
 * Mean Squared Error and Mean Absolute Epsilon-Loss for SVR
 */
export function computeSvrLoss(
  points: RegressionPoint[],
  predictFn: (x: number) => number,
  epsilon: number
): { mse: number; mae: number; totalSlack: number; svCount: number } {
  if (points.length === 0) return { mse: 0, mae: 0, totalSlack: 0, svCount: 0 };

  let mseSum = 0;
  let maeSum = 0;
  let totalSlack = 0;
  let svCount = 0;

  for (const pt of points) {
    const yHat = predictFn(pt.x);
    const err = pt.y - yHat;
    mseSum += err * err;
    maeSum += Math.abs(err);
    const { xi, xiStar, isSupportVector } = calculateSvrSlacks(pt.y, yHat, epsilon);
    totalSlack += xi + xiStar;
    if (isSupportVector) svCount++;
  }

  return {
    mse: mseSum / points.length,
    mae: maeSum / points.length,
    totalSlack,
    svCount
  };
}
