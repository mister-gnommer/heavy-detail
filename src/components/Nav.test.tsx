import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Nav from "./Nav";

describe("Nav", () => {
  it("renders all three navigation labels", () => {
    render(<Nav activeView="dashboard" onViewChange={vi.fn()} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Log")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("renders the brand name", () => {
    render(<Nav activeView="dashboard" onViewChange={vi.fn()} />);
    expect(screen.getByText("Heavy Detail")).toBeInTheDocument();
  });

  it("active button has aria-current set", () => {
    render(<Nav activeView="log" onViewChange={vi.fn()} />);
    const logButton = screen.getByText("Log").closest("button");
    expect(logButton).toHaveAttribute("aria-current", "page");
  });

  it("inactive buttons do not have aria-current set", () => {
    render(<Nav activeView="dashboard" onViewChange={vi.fn()} />);
    const logButton = screen.getByText("Log").closest("button");
    expect(logButton).not.toHaveAttribute("aria-current");
  });

  it("clicking an inactive button calls onViewChange with the correct view", async () => {
    const onViewChange = vi.fn();
    render(<Nav activeView="dashboard" onViewChange={onViewChange} />);
    await userEvent.click(screen.getByText("History"));
    expect(onViewChange).toHaveBeenCalledWith("history");
  });
});
