import { Temporal } from "@js-temporal/polyfill";
import { linearRegression, linearRegressionLine } from "simple-statistics";
import type { WeightEntry } from "./weightApi";

export interface ChartPoint {
  date: string;
  weight: number;
  rollingAvg?: number;
}

/** Compute rolling average over a calendar day window. Entries must be sorted ascending by date. */
export function computeRollingAverage(entries: WeightEntry[], windowDays = 7): ChartPoint[] {
  return entries.map((entry) => {
    const entryDate = Temporal.PlainDate.from(entry.date);
    const windowStart = entryDate.subtract({ days: windowDays - 1 });
    const slice = entries.filter((e) => {
      const date = Temporal.PlainDate.from(e.date);
      return (
        Temporal.PlainDate.compare(date, windowStart) >= 0 &&
        Temporal.PlainDate.compare(date, entryDate) <= 0
      );
    });
    const avg = slice.reduce((sum, e) => sum + e.weight_kg, 0) / slice.length;
    return {
      date: entry.date,
      weight: entry.weight_kg,
      rollingAvg: parseFloat(avg.toFixed(2)),
    };
  });
}

export enum GoalPredictionKind {
  Predicted = "predicted",
  InsufficientData = "insufficient_data",
  FlatTrend = "flat_trend",
  WrongDirection = "wrong_direction",
}

export type GoalPrediction =
  | { kind: GoalPredictionKind.Predicted; date: Temporal.PlainDate }
  | { kind: GoalPredictionKind.InsufficientData }
  | { kind: GoalPredictionKind.FlatTrend }
  | { kind: GoalPredictionKind.WrongDirection };

/** Predict when weight will reach goalKg using linear regression on recent entries. */
export function predictGoalDate(
  entries: WeightEntry[],
  goalKg: number,
  lookbackDays = 30
): GoalPrediction {
  const cutoff = Temporal.Now.plainDateISO().subtract({ days: lookbackDays });
  const recent = entries.filter(
    (e) => Temporal.PlainDate.compare(Temporal.PlainDate.from(e.date), cutoff) >= 0
  );
  if (recent.length < 3) {
    return { kind: GoalPredictionKind.InsufficientData };
  }

  const t0 = Temporal.PlainDate.from(recent[0].date);
  const points: [number, number][] = recent.map((e) => [
    t0.until(Temporal.PlainDate.from(e.date)).days,
    e.weight_kg,
  ]);

  const { m, b } = linearRegression(points);
  if (m === 0) {
    return { kind: GoalPredictionKind.FlatTrend };
  }
  const line = linearRegressionLine({ m, b });
  // Safe: recent.length >= 3 checked above, so points is non-empty
  const currentPredicted = line(points.at(-1)![0]);
  const isTrendingTowardGoal =
    (m < 0 && goalKg < currentPredicted) || (m > 0 && goalKg > currentPredicted);
  if (!isTrendingTowardGoal) {
    return { kind: GoalPredictionKind.WrongDirection };
  }

  const daysToGoal = (goalKg - b) / m;
  return { kind: GoalPredictionKind.Predicted, date: t0.add({ days: Math.ceil(daysToGoal) }) };
}
