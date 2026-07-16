import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Temporal } from "@js-temporal/polyfill";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GoalCard from "./GoalCard";
import { useConfig } from "../lib/configApi";
import { makeEntries } from "../test/helpers";

vi.mock("../lib/configApi", () => ({
  useConfig: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      {children}
    </QueryClientProvider>
  );
}

describe("GoalCard", () => {
  beforeEach(() => {
    vi.spyOn(Temporal.Now, "plainDateISO").mockReturnValue(Temporal.PlainDate.from("2025-06-01"));
    vi.mocked(useConfig).mockImplementation(() => {
      const [goal, setGoal] = useState("");
      return {
        getString: (key: string, fallback: string) => {
          if (key === "goal_weight_kg") return goal || fallback;
          return fallback;
        },
        getNumber: vi.fn(),
        setValue: (key: string, value: string) => {
          if (key === "goal_weight_kg") setGoal(value);
        },
        isLoading: false,
        isSaving: false,
        error: null,
      };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows no status message when goal input is empty", () => {
    render(<GoalCard entries={[]} />, { wrapper });
    expect(screen.queryByText(/Not enough|Trend is|Estimated/)).not.toBeInTheDocument();
  });

  it("shows InsufficientData message for empty entries with a goal set", async () => {
    render(<GoalCard entries={[]} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Goal weight (kg)"), "75");
    expect(screen.getByText("Not enough data yet")).toBeInTheDocument();
  });

  it("shows FlatTrend message for entries with identical weight", async () => {
    const entries = makeEntries([
      ["2025-05-20", 80],
      ["2025-05-22", 80],
      ["2025-05-25", 80],
      ["2025-05-28", 80],
      ["2025-05-31", 80],
    ]);
    render(<GoalCard entries={entries} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Goal weight (kg)"), "75");
    expect(screen.getByText("Trend is flat — no goal date possible")).toBeInTheDocument();
  });

  it("shows WrongDirection message when trend is not heading toward goal", async () => {
    const entries = makeEntries([
      ["2025-05-20", 80],
      ["2025-05-23", 79.5],
      ["2025-05-26", 79],
      ["2025-05-29", 78.5],
      ["2025-05-31", 78],
    ]);
    render(<GoalCard entries={entries} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Goal weight (kg)"), "85");
    expect(screen.getByText("Trend is not heading toward goal")).toBeInTheDocument();
  });

  it("shows Predicted message with date and days count", async () => {
    const entries = makeEntries([
      ["2025-05-25", 85],
      ["2025-05-26", 84.5],
      ["2025-05-27", 84],
      ["2025-05-28", 83.5],
      ["2025-05-29", 83],
      ["2025-05-30", 82.5],
      ["2025-05-31", 82],
    ]);
    render(<GoalCard entries={entries} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Goal weight (kg)"), "80");
    const msg = screen.getByText(/Estimated reach:/);
    expect(msg).toBeInTheDocument();
    expect(msg.textContent).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(msg.textContent).toMatch(/\d+d/);
  });

  it("updates message reactively when goal changes", async () => {
    const entries = makeEntries([
      ["2025-05-20", 80],
      ["2025-05-23", 79.5],
      ["2025-05-26", 79],
      ["2025-05-29", 78.5],
      ["2025-05-31", 78],
    ]);
    render(<GoalCard entries={entries} />, { wrapper });
    const input = screen.getByLabelText("Goal weight (kg)");
    await userEvent.type(input, "85");
    // wrong direction: trending down, goal is above current
    expect(screen.getByText("Trend is not heading toward goal")).toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, "75");
    // correct direction: trending down, goal is below current
    expect(screen.getByText(/Estimated reach:/)).toBeInTheDocument();
  });

  it("accepts comma as decimal separator in goal input", async () => {
    const entries = makeEntries([
      ["2025-05-25", 85],
      ["2025-05-26", 84.5],
      ["2025-05-27", 84],
      ["2025-05-28", 83.5],
      ["2025-05-29", 83],
      ["2025-05-30", 82.5],
      ["2025-05-31", 82],
    ]);
    render(<GoalCard entries={entries} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Goal weight (kg)"), "80,5");
    const msg = screen.getByText(/Estimated reach:/);
    expect(msg).toBeInTheDocument();
  });
});
