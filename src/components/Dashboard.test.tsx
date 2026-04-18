import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./Dashboard";
import * as weightApi from "../lib/weightApi";
import { makeEntries } from "../test/helpers";

vi.mock("../lib/weightApi", () => ({
  getAllEntries: vi.fn(),
  addEntry: vi.fn(),
  deleteEntry: vi.fn(),
  getRecentEntries: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading state while query is pending", () => {
    vi.mocked(weightApi.getAllEntries).mockReturnValue(new Promise(() => {}));
    render(<Dashboard />, { wrapper });
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty state placeholder and hides TrendCard", async () => {
    vi.mocked(weightApi.getAllEntries).mockResolvedValue([]);
    render(<Dashboard />, { wrapper });
    expect(await screen.findByText("No data yet.")).toBeInTheDocument();
    expect(screen.queryByText("Current Weight")).not.toBeInTheDocument();
  });

  it("renders latest entry weight in TrendCard when entries are present", async () => {
    // getAllEntries returns DESC order (newest first); Dashboard reverses to ascending for chart
    const entries = makeEntries([
      ["2025-05-02", 82.5],
      ["2025-05-01", 83],
    ]);
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(entries);
    render(<Dashboard />, { wrapper });
    // After reversal, at(-1) = last ascending entry = May 2 = 82.5
    expect(await screen.findByText("82.5 kg")).toBeInTheDocument();
  });

  it("renders Weight Over Time heading when entries are present", async () => {
    const entries = makeEntries([["2025-05-01", 82]]);
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(entries);
    render(<Dashboard />, { wrapper });
    expect(await screen.findByText("Weight Over Time")).toBeInTheDocument();
  });
});
