import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrendCard from "./TrendCard";

describe("TrendCard", () => {
  it("renders scaleWeight with 1 decimal place", () => {
    render(<TrendCard scaleWeight={82.512345} trendWeight={null} />);
    expect(screen.getByText("82.5 kg")).toBeInTheDocument();
  });

  it("renders trendWeight and diff badge when trendWeight is provided", () => {
    render(<TrendCard scaleWeight={84} trendWeight={82} />);
    expect(screen.getByText("82.0 kg")).toBeInTheDocument();
    expect(screen.getByText("+2.0")).toBeInTheDocument();
  });

  it("diff badge has red styling for positive diff (scale above trend)", () => {
    render(<TrendCard scaleWeight={84} trendWeight={82} />);
    const badge = screen.getByText("+2.0");
    expect(badge).toHaveStyle({ color: "var(--color-not-good)" });
  });

  it("diff badge has green styling for negative diff (scale below trend)", () => {
    render(<TrendCard scaleWeight={80} trendWeight={82} />);
    const badge = screen.getByText("-2.0");
    expect(badge).toHaveStyle({ color: "var(--color-good)" });
  });

  it("diff of 0 renders with green styling (diff > 0 is false)", () => {
    render(<TrendCard scaleWeight={80} trendWeight={80} />);
    const badge = screen.getByText("0.0");
    expect(badge).toHaveStyle({ color: "var(--color-good)" });
  });

  it("trendWeight null: trend section not rendered", () => {
    render(<TrendCard scaleWeight={82} trendWeight={null} />);
    expect(screen.queryByText("7-day trend:")).not.toBeInTheDocument();
  });
});
