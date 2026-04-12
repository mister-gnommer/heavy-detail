import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAllEntries } from "../lib/weightApi";
import { computeRollingAverage } from "../lib/analytics";
import { queryKeys } from "../lib/queryKeys";
import TrendCard from "./TrendCard";
import GoalCard from "./GoalCard";

export default function Dashboard() {
  const { data: allEntries = [], isLoading } = useQuery({
    queryKey: queryKeys.entries.all,
    queryFn: getAllEntries,
    select: (data) => [...data].reverse(), // ascending for chart
  });

  const chartData = computeRollingAverage(allEntries);

  if (isLoading) {
    return (
      <p className="text-center mt-8" style={{ color: "var(--color-muted-foreground)" }}>
        Loading…
      </p>
    );
  }

  if (allEntries.length === 0) {
    return (
      <div className="text-center mt-16">
        <p className="text-lg font-medium">No data yet.</p>
        <p className="text-sm mt-1" style={{ color: "var(--color-muted-foreground)" }}>
          Use "Log" to add your first weight entry.
        </p>
      </div>
    );
  }

  // Safe: allEntries.length === 0 is handled by the early return above
  const latestEntry = allEntries.at(-1)!;
  const latestRolling = chartData.at(-1)?.rollingAvg ?? null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <TrendCard scaleWeight={latestEntry.weight_kg} trendWeight={latestRolling} />
        <GoalCard entries={allEntries} />
      </div>

      <div
        className="rounded-lg border p-5 shadow-sm"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
      >
        <h2 className="text-base font-semibold mb-4">Weight Over Time</h2>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart
            data={chartData}
            margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
              stroke="var(--color-border)"
            />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11 }} stroke="var(--color-border)" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              type="linear"
              dataKey="weight"
              name="Weigh-in"
              stroke="hsl(240 5.9% 60%)"
              dot={{ r: 3, fill: "hsl(240 5.9% 60%)" }}
              strokeWidth={1}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="rollingAvg"
              name="7-day avg"
              stroke="hsl(221 83% 53%)"
              dot={false}
              strokeWidth={2.5}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
