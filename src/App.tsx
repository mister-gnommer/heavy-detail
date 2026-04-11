import { useState } from "react";
import Nav from "./components/Nav";
import Dashboard from "./components/Dashboard";
import WeightForm from "./components/WeightForm";
import WeightHistory from "./components/WeightHistory";

export type View = "dashboard" | "log" | "history";

export default function App() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-background)", color: "var(--color-foreground)" }}>
      <Nav activeView={view} onViewChange={setView} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {view === "dashboard" && <Dashboard />}
        {view === "log" && <WeightForm onSaved={() => setView("dashboard")} />}
        {view === "history" && <WeightHistory />}
      </main>
    </div>
  );
}
