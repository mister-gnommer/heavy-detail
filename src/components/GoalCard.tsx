import { useState } from "react";
import { predictGoalDate } from "../lib/analytics";
import type { WeightEntry } from "../lib/weightApi";

interface Props {
  entries: WeightEntry[];
}

export default function GoalCard({ entries }: Props) {
  const [goalKg, setGoalKg] = useState("");

  const goalDate =
    goalKg && entries.length >= 3
      ? predictGoalDate(entries, parseFloat(goalKg))
      : null;

  const formattedDate = goalDate
    ? goalDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

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
            placeholder="e.g. 75.0"
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
        {goalKg && (
          <p className="text-sm">
            {formattedDate ? (
              <>
                Estimated reach:{" "}
                <span className="font-semibold">{formattedDate}</span>
              </>
            ) : (
              <span style={{ color: "var(--color-muted-foreground)" }}>
                {entries.length < 3
                  ? "Need at least 3 entries"
                  : "Trend not heading toward goal"}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
