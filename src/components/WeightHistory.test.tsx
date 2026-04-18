import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WeightHistory from "./WeightHistory";
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

describe("WeightHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("shows loading state while query is pending", () => {
    vi.mocked(weightApi.getAllEntries).mockReturnValue(new Promise(() => {}));
    render(<WeightHistory />, { wrapper });
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows empty message when no entries", async () => {
    vi.mocked(weightApi.getAllEntries).mockResolvedValue([]);
    render(<WeightHistory />, { wrapper });
    expect(await screen.findByText("No entries yet.")).toBeInTheDocument();
  });

  it("renders one row per entry with date and weight", async () => {
    const entries = makeEntries([
      ["2025-05-01", 83],
      ["2025-05-02", 82],
      ["2025-05-03", 81],
    ]);
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(entries);
    render(<WeightHistory />, { wrapper });
    await screen.findByText("2025-05-01");
    expect(screen.getByText("2025-05-02")).toBeInTheDocument();
    expect(screen.getByText("2025-05-03")).toBeInTheDocument();
  });

  it("weight is displayed with 1 decimal place", async () => {
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(
      makeEntries([["2025-05-01", 82]]),
    );
    render(<WeightHistory />, { wrapper });
    expect(await screen.findByText("82.0")).toBeInTheDocument();
  });

  it("each row has a delete button", async () => {
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(
      makeEntries([["2025-05-01", 82], ["2025-05-02", 81]]),
    );
    render(<WeightHistory />, { wrapper });
    await screen.findByText("2025-05-01");
    expect(screen.getAllByRole("button", { name: "Delete entry" })).toHaveLength(2);
  });

  it("clicking delete calls deleteEntry with the correct id", async () => {
    vi.mocked(weightApi.getAllEntries).mockResolvedValue(
      makeEntries([["2025-05-01", 82]]),
    );
    vi.mocked(weightApi.deleteEntry).mockResolvedValue(undefined);
    render(<WeightHistory />, { wrapper });
    await screen.findByText("2025-05-01");
    await userEvent.click(screen.getByRole("button", { name: "Delete entry" }));
    // TanStack Query v5 passes a context object as the second arg to mutationFn; check first arg only
    await waitFor(() => expect(vi.mocked(weightApi.deleteEntry).mock.calls[0][0]).toBe(1));
  });

  it("successful delete triggers a refetch (query invalidation)", async () => {
    vi.mocked(weightApi.getAllEntries)
      .mockResolvedValueOnce(makeEntries([["2025-05-01", 82]]))
      .mockResolvedValueOnce([]);
    vi.mocked(weightApi.deleteEntry).mockResolvedValue(undefined);
    render(<WeightHistory />, { wrapper });
    await screen.findByText("2025-05-01");
    await userEvent.click(screen.getByRole("button", { name: "Delete entry" }));
    await waitFor(() => expect(weightApi.getAllEntries).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("No entries yet.")).toBeInTheDocument();
  });
});
