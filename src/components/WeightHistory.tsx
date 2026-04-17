import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { getAllEntries, deleteEntry } from "../lib/weightApi";
import { queryKeys } from "../lib/queryKeys";

export default function WeightHistory() {
  const queryClient = useQueryClient();
  const { data: entries = [], isLoading } = useQuery({
    queryKey: queryKeys.entries.all,
    queryFn: getAllEntries,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEntry,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.entries.all }),
  });

  if (isLoading) {
    return (
      <p className="text-center mt-8" style={{ color: "var(--color-muted-foreground)" }}>
        Loading…
      </p>
    );
  }

  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-4">All Entries</h2>
      {entries.length === 0 ? (
        <p style={{ color: "var(--color-muted-foreground)" }}>No entries yet.</p>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottomColor: "var(--color-border)", borderBottomWidth: 1, backgroundColor: "var(--color-muted)" }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                  Weight (kg)
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr
                  key={e.id}
                  style={{
                    borderTopColor: "var(--color-border)",
                    borderTopWidth: i > 0 ? 1 : 0,
                  }}
                >
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3 font-medium">{e.weight_kg.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteMutation.mutate(e.id)}
                      className="rounded p-1 transition-colors hover:bg-red-100"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "var(--color-destructive)" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
