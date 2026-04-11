import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addEntry } from "../lib/weightApi";
import { queryKeys } from "../lib/queryKeys";
import DatePicker from "./DatePicker";

interface Props {
  onSaved: () => void;
}

export default function WeightForm({ onSaved }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [weight, setWeight] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => addEntry(date, parseFloat(weight)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
      onSaved();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isNaN(parseFloat(weight))) return;
    mutation.mutate();
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <div
        className="rounded-lg border p-6 shadow-sm"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
      >
        <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
          Log Weight
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label
              className="text-sm font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Date
            </label>
            <DatePicker value={date} onChange={setDate} max={today} />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="weight"
              className="text-sm font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              step="0.1"
              min="20"
              max="500"
              placeholder="e.g. 82.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {mutation.isPending ? "Saving…" : "Save Entry"}
          </button>
          {mutation.isError && (
            <p className="text-sm" style={{ color: "var(--color-destructive)" }}>
              Failed to save. Try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
