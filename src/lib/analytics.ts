import { linearRegression, linearRegressionLine } from "simple-statistics";
import type { WeightEntry } from "./weightApi";

export interface ChartPoint {
  date: string;
  weight: number;
  rollingAvg?: number;
}

/** Compute 7-day rolling average. Entries must be sorted ascending by date. */
export function computeRollingAverage(
  entries: WeightEntry[],
  window = 7,
): ChartPoint[] {
  return entries.map((entry, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = entries.slice(start, i + 1);
    const avg = slice.reduce((sum, e) => sum + e.weight_kg, 0) / slice.length;
    return {
      date: entry.date,
      weight: entry.weight_kg,
      rollingAvg: parseFloat(avg.toFixed(2)),
    };
  });
}

/**
 * Predict when weight will reach goalKg using linear regression on recent entries.
 * Returns null if not enough data or trend is not heading toward the goal.
 */
export function predictGoalDate(
  entries: WeightEntry[],
  goalKg: number,
  lookbackDays = 30,
): Date | null {
  const clampedDays = Math.min(30, Math.max(14, lookbackDays));
  const recent = entries.slice(-clampedDays);
  if (recent.length < 3) return null;

  const t0 = new Date(recent[0].date).getTime();
  const points: [number, number][] = recent.map((e) => [
    (new Date(e.date).getTime() - t0) / 86_400_000,
    e.weight_kg,
  ]);

  const { m, b } = linearRegression(points);
  if (m === 0) return null;

  const line = linearRegressionLine({ m, b });
  const currentPredicted = line(points[points.length - 1][0]);
  const isTrendingTowardGoal =
    (m < 0 && goalKg < currentPredicted) || (m > 0 && goalKg > currentPredicted);
  if (!isTrendingTowardGoal) return null;

  const daysToGoal = (goalKg - b) / m;
  if (daysToGoal < 0) return null;

  return new Date(t0 + daysToGoal * 86_400_000);
}

export function currentTrendWeight(points: ChartPoint[]): number | null {
  if (!points.length) return null;
  return points[points.length - 1].rollingAvg ?? null;
}
