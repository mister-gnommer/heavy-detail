import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Settings from "./Settings";

vi.mock("../lib/db", () => ({
  getDbPath: vi.fn(() => "sqlite:test.db"),
  setDbPath: vi.fn(),
  reloadDb: vi.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
}

describe("Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the heading and input with current path", () => {
    renderWithQuery(<Settings />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByLabelText("Database File Path")).toHaveValue("sqlite:test.db");
  });

  it("calls setDbPath and reloadDb on save", async () => {
    const { setDbPath, reloadDb } = await import("../lib/db");
    renderWithQuery(<Settings />);
    const input = screen.getByLabelText("Database File Path");
    await userEvent.clear(input);
    await userEvent.type(input, "sqlite:custom.db");
    await userEvent.click(screen.getByText("Save"));
    expect(setDbPath).toHaveBeenCalledWith("sqlite:custom.db");
    expect(reloadDb).toHaveBeenCalledOnce();
  });

  it("shows success message after saving", async () => {
    renderWithQuery(<Settings />);
    await userEvent.click(screen.getByText("Save"));
    expect(screen.getByText("Path saved. Existing views will reload with the new database.")).toBeInTheDocument();
  });
});
