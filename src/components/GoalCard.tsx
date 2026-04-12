import { useState } from "react";
import { Temporal } from "@js-temporal/polyfill";
import { predictGoalDate, GoalPredictionKind, type GoalPrediction } from "../lib/analytics";
import type { WeightEntry } from "../lib/weightApi";

interface Props {
  entries: WeightEntry[];
}

export default function GoalCard({ entries }: Props) {
  const [goalKg, setGoalKg] = useState("");

  const prediction: GoalPrediction | null = goalKg
    ? predictGoalDate(entries, parseFloat(goalKg))
    : null;

  const statusMessage = () => {
    if (!prediction) return null;
    switch (prediction.kind) {
      case GoalPredictionKind.Predicted: {
        const date = prediction.date.toString();
        const days = Temporal.Now.plainDateISO().until(prediction.date).days;
        return `Estimated reach: ${date} (${days}d)`;
      }
      case GoalPredictionKind.InsufficientData: return "Not enough data yet";
      case GoalPredictionKind.FlatTrend:        return "Trend is flat — no goal date possible";
      case GoalPredictionKind.WrongDirection:   return "Trend is not heading toward goal";
    }
  };

  return (
    <div
      className="rounded-lg border p-5 shadow-sm"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      <p className="text-sm font-medium mb-3" style={{ color: "var(--color-muted-foreground)" }}>
        Goal Estimator
      </p>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <label
            htmlFor="goal"
            className="text-sm font-medium"
            style={{ color: "var(--color-foreground)" }}
          >
            Goal weight (kg)
          </label>
          <input
            id="goal"
            type="number"
            step="0.5"
            placeholder="e.g. 102.5"
            value={goalKg}
            onChange={(e) => setGoalKg(e.target.value)}
            className="w-36 rounded-md border px-3 py-1.5 text-sm outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-border)",
              backgroundColor: "var(--color-background)",
              color: "var(--color-foreground)",
            }}
          />
        </div>
        {statusMessage() && (
          <p className="text-sm">{statusMessage()}</p>
        )}
      </div>
    </div>
  );
}
