import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DatePicker from "./DatePicker";

describe("DatePicker", () => {
  it("renders input with the provided value", () => {
    render(<DatePicker value="2025-05-15" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue("2025-05-15")).toBeInTheDocument();
  });

  it("calendar is hidden on initial render", () => {
    render(<DatePicker value="2025-05-15" onChange={vi.fn()} />);
    // DayPicker renders a grid when open; it should not exist initially
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("clicking the input opens the calendar", async () => {
    render(<DatePicker value="2025-05-15" onChange={vi.fn()} />);
    await userEvent.click(screen.getByDisplayValue("2025-05-15"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("clicking the input again closes the calendar", async () => {
    render(<DatePicker value="2025-05-15" onChange={vi.fn()} />);
    const input = screen.getByDisplayValue("2025-05-15");
    await userEvent.click(input);
    await userEvent.click(input);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("mousedown outside the component closes the calendar", async () => {
    render(<DatePicker value="2025-05-15" onChange={vi.fn()} />);
    await userEvent.click(screen.getByDisplayValue("2025-05-15"));
    expect(screen.getByRole("grid")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("selecting a day calls onChange with yyyy-MM-dd format and closes the calendar", async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2025-05-01" onChange={onChange} />);
    await userEvent.click(screen.getByDisplayValue("2025-05-01"));
    // Click the 15th day button in the calendar
    const day15 = screen.getByRole("button", { name: /15/ });
    await userEvent.click(day15);
    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange.mock.calls[0][0]).toBe("2025-05-15");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it("max prop: dates after max are not rendered as interactive buttons", async () => {
    render(<DatePicker value="2025-05-01" onChange={vi.fn()} max="2025-05-10" />);
    await userEvent.click(screen.getByDisplayValue("2025-05-01"));
    // react-day-picker renders dates after max as non-interactive td cells (no button element)
    expect(screen.queryByRole("button", { name: "Saturday, May 20th, 2025" })).not.toBeInTheDocument();
    // Verify a date within range still has a button
    expect(screen.getByRole("button", { name: "Monday, May 5th, 2025" })).toBeInTheDocument();
  });
});
