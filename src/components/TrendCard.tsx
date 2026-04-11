interface Props {
  scaleWeight: number;
  trendWeight: number | null;
}

export default function TrendCard({ scaleWeight, trendWeight }: Props) {
  const diff = trendWeight != null ? scaleWeight - trendWeight : null;
  const isAbove = diff !== null && diff > 0;

  return (
    <div
      className="rounded-lg border p-5 shadow-sm"
      style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
    >
      <p className="text-sm font-medium mb-2" style={{ color: "var(--color-muted-foreground)" }}>
        Current Weight
      </p>
      <p className="text-3xl font-bold mb-3">{scaleWeight.toFixed(1)} kg</p>
      {trendWeight != null && (
        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--color-muted-foreground)" }}>7-day trend:</span>
          <span className="font-medium">{trendWeight.toFixed(1)} kg</span>
          {diff !== null && (
            <span
              className="text-xs font-semibold px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: isAbove ? "hsl(0 84.2% 95%)" : "hsl(142 76% 95%)",
                color: isAbove ? "var(--color-destructive)" : "hsl(142 76% 36%)",
              }}
            >
              {diff > 0 ? "+" : ""}{diff.toFixed(1)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
