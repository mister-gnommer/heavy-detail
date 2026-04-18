import { describe, it, expect, vi } from "vitest";
import { Temporal } from "@js-temporal/polyfill";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import WeightForm from "./WeightForm";
import * as weightApi from "../lib/weightApi";

vi.mock("../lib/weightApi", () => ({
  addEntry: vi.fn(),
  getAllEntries: vi.fn(),
  deleteEntry: vi.fn(),
  getRecentEntries: vi.fn(),
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

describe("WeightForm", () => {
  it("renders date input, weight input, and submit button", () => {
    render(<WeightForm onSaved={vi.fn()} />, { wrapper });
    expect(screen.getByLabelText("Weight (kg)")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save Entry" })).toBeInTheDocument();
  });

  it("submit does not call addEntry when weight is empty", async () => {
    render(<WeightForm onSaved={vi.fn()} />, { wrapper });
    await userEvent.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(weightApi.addEntry).not.toHaveBeenCalled();
  });

  it("renders date input defaulting to today", () => {
    render(<WeightForm onSaved={vi.fn()} />, { wrapper });
    const today = Temporal.Now.plainDateISO().toString();
    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
  });

  it("successful submit calls addEntry with the selected date and weight", async () => {
    vi.mocked(weightApi.addEntry).mockResolvedValue(undefined);
    const onSaved = vi.fn();
    render(<WeightForm onSaved={onSaved} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Weight (kg)"), "82.5");
    await userEvent.click(screen.getByRole("button", { name: "Save Entry" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce());
    const today = Temporal.Now.plainDateISO().toString();
    expect(weightApi.addEntry).toHaveBeenCalledWith(today, 82.5);
  });

  it("shows Saving… and disables button while mutation is pending", async () => {
    let resolve: () => void; // assigned inside Promise constructor; TS can't prove it, hence ! at call site
    vi.mocked(weightApi.addEntry).mockReturnValue(
      new Promise<void>((r) => {
        resolve = r;
      })
    );
    render(<WeightForm onSaved={vi.fn()} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Weight (kg)"), "82.5");
    await userEvent.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(await screen.findByRole("button", { name: "Saving…" })).toBeDisabled();
    resolve!();
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Saving…" })).not.toBeInTheDocument()
    );
  });

  it("shows error message when addEntry rejects", async () => {
    vi.mocked(weightApi.addEntry).mockRejectedValue(new Error("DB error"));
    render(<WeightForm onSaved={vi.fn()} />, { wrapper });
    await userEvent.type(screen.getByLabelText("Weight (kg)"), "82.5");
    await userEvent.click(screen.getByRole("button", { name: "Save Entry" }));
    expect(await screen.findByText("Failed to save. Try again.")).toBeInTheDocument();
  });
});
