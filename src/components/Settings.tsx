import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getDbPath, setDbPath, reloadDb } from "../lib/db";
import { queryKeys } from "../lib/queryKeys";

export default function Settings() {
  const [path, setPath] = useState(getDbPath);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const queryClient = useQueryClient();

  const handleSave = async () => {
    try {
      setDbPath(path);
      await reloadDb();
      await queryClient.invalidateQueries({ queryKey: queryKeys.entries.all });
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-8">
      <div
        className="rounded-lg border p-6 shadow-sm"
        style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-card)" }}
      >
        <h2 className="text-xl font-semibold mb-6" style={{ color: "var(--color-foreground)" }}>
          Settings
        </h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="db-path"
              className="text-sm font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Database File Path
            </label>
            <input
              id="db-path"
              type="text"
              value={path}
              onChange={(e) => { setPath(e.target.value); setStatus("idle"); }}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 font-mono"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-background)",
                color: "var(--color-foreground)",
              }}
            />
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              Connection string for the SQLite database (e.g. sqlite:heavy-detail.db)
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full rounded-md px-4 py-2 text-sm font-medium transition-opacity"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            Save
          </button>

          {status === "saved" && (
            <p className="text-sm" style={{ color: "var(--color-good)" }}>
              Path saved. Existing views will reload with the new database.
            </p>
          )}
          {status === "error" && (
            <p className="text-sm" style={{ color: "var(--color-not-good)" }}>
              Failed to switch database. Check the path and try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
