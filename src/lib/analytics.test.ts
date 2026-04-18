import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { computeRollingAverage, predictGoalDate, GoalPredictionKind } from "./analytics";
import { makeEntry, makeEntries } from "../test/helpers";

describe("computeRollingAverage", () => {
  it("returns empty array for empty input", () => {
    expect(computeRollingAverage([])).toEqual([]);
  });

  it("single entry returns rollingAvg equal to its weight", () => {
    const result = computeRollingAverage([makeEntry("2025-01-10", 80)]);
    expect(result).toHaveLength(1);
    expect(result[0].rollingAvg).toBe(80);
    expect(result[0].weight).toBe(80);
  });

  it("first entry in multi-entry set uses only that entry (window not yet full)", () => {
    const entries = makeEntries([
      ["2025-01-01", 80],
      ["2025-01-02", 82],
      ["2025-01-03", 84],
    ]);
    const result = computeRollingAverage(entries);
    expect(result[0].rollingAvg).toBe(80);
  });

  it("7th entry's rollingAvg is the mean of all 7 entries when all within window", () => {
    const entries = makeEntries([
      ["2025-01-01", 80],
      ["2025-01-02", 81],
      ["2025-01-03", 82],
      ["2025-01-04", 83],
      ["2025-01-05", 84],
      ["2025-01-06", 85],
      ["2025-01-07", 86],
    ]);
    const result = computeRollingAverage(entries);
    expect(result[6].rollingAvg).toBe(83); // (80+81+82+83+84+85+86)/7 = 581/7 = 83
  });

  it("8th entry excludes the 1st (7-day window)", () => {
    const entries = makeEntries([
      ["2025-01-01", 70], // excluded from day 8's window (Jan 2–8)
      ["2025-01-02", 80],
      ["2025-01-03", 80],
      ["2025-01-04", 80],
      ["2025-01-05", 80],
      ["2025-01-06", 80],
      ["2025-01-07", 80],
      ["2025-01-08", 80],
    ]);
    const result = computeRollingAverage(entries);
    expect(result[7].rollingAvg).toBe(80);
  });

  it("non-consecutive dates: window is calendar days not array position", () => {
    const entries = makeEntries([
      ["2025-01-01", 70], // Jan 1 is outside a 7-day window ending Jan 10 (window: Jan 4–10)
      ["2025-01-05", 80],
      ["2025-01-10", 90],
    ]);
    const result = computeRollingAverage(entries);
    // Jan 10 window: Jan 4–10 → includes Jan 5 (80) and Jan 10 (90)
    expect(result[2].rollingAvg).toBe(85); // (80+90)/2 = 85
  });

  it("custom windowDays param is respected", () => {
    const entries = makeEntries([
      ["2025-01-01", 70],
      ["2025-01-02", 80],
      ["2025-01-03", 90],
    ]);
    const result = computeRollingAverage(entries, 2);
    // Jan 3 window (2 days): Jan 2–3 → (80+90)/2 = 85
    expect(result[2].rollingAvg).toBe(85);
  });

  it("duplicate dates on the same calendar day are both included in the window", () => {
    const entries = makeEntries([
      ["2025-01-01", 80],
      ["2025-01-01", 82], // same day correction
      ["2025-01-02", 84],
    ]);
    const result = computeRollingAverage(entries);
    // All three within a 7-day window ending Jan 2: (80+82+84)/3 = 82
    expect(result[2].rollingAvg).toBe(82);
  });

  it("rollingAvg is rounded to 2 decimal places", () => {
    const entries = makeEntries([
      ["2025-01-01", 80],
      ["2025-01-02", 80],
      ["2025-01-03", 81],
    ]);
    const result = computeRollingAverage(entries);
    // (80+80+81)/3 = 241/3 = 80.333... → rounds to 80.33
    expect(result[2].rollingAvg).toBe(80.33);
  });
});

describe("predictGoalDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-01"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("InsufficientData: 0 entries", () => {
    const result = predictGoalDate([], 75);
    expect(result.kind).toBe(GoalPredictionKind.InsufficientData);
  });

  it("InsufficientData: 2 entries within lookback (boundary: threshold is 3)", () => {
    const entries = makeEntries([
      ["2025-05-28", 81],
      ["2025-05-30", 80],
    ]);
    expect(predictGoalDate(entries, 75).kind).toBe(GoalPredictionKind.InsufficientData);
  });

  it("not InsufficientData at exactly 3 recent entries (boundary: threshold is 3)", () => {
    const entries = makeEntries([
      ["2025-05-25", 82],
      ["2025-05-28", 81],
      ["2025-05-31", 80],
    ]);
    expect(predictGoalDate(entries, 75).kind).not.toBe(GoalPredictionKind.InsufficientData);
  });

  it("InsufficientData: 5 entries but all older than 30 days", () => {
    const entries = makeEntries([
      ["2025-04-01", 85],
      ["2025-04-05", 84],
      ["2025-04-10", 83],
      ["2025-04-15", 82],
      ["2025-04-20", 81],
    ]);
    const result = predictGoalDate(entries, 75);
    expect(result.kind).toBe(GoalPredictionKind.InsufficientData);
  });

  it("FlatTrend: all entries have identical weight (slope = 0)", () => {
    const entries = makeEntries([
      ["2025-05-20", 80],
      ["2025-05-22", 80],
      ["2025-05-25", 80],
      ["2025-05-28", 80],
      ["2025-05-31", 80],
    ]);
    const result = predictGoalDate(entries, 75);
    expect(result.kind).toBe(GoalPredictionKind.FlatTrend);
  });

  it("WrongDirection: downward trend but goal is above current weight", () => {
    const entries = makeEntries([
      ["2025-05-20", 80],
      ["2025-05-23", 79.5],
      ["2025-05-26", 79],
      ["2025-05-29", 78.5],
      ["2025-05-31", 78],
    ]);
    // trend is going down, goal is above current — wrong direction for gaining
    const result = predictGoalDate(entries, 85);
    expect(result.kind).toBe(GoalPredictionKind.WrongDirection);
  });

  it("WrongDirection: upward trend but goal is below current weight", () => {
    const entries = makeEntries([
      ["2025-05-20", 75],
      ["2025-05-23", 75.5],
      ["2025-05-26", 76],
      ["2025-05-29", 76.5],
      ["2025-05-31", 77],
    ]);
    // trend is going up, goal is below current — wrong direction for losing
    const result = predictGoalDate(entries, 70);
    expect(result.kind).toBe(GoalPredictionKind.WrongDirection);
  });

  it("Predicted: weight-loss scenario with clear linear trend", () => {
    // slope -0.5/day, starting at 85 on May 25. Goal 80.
    // regression: b≈85, m≈-0.5. daysToGoal = (80 - 85) / -0.5 = 10 days from t0 (May 25)
    // t0.add({ days: ceil(10) }) = Jun 4
    const entries = makeEntries([
      ["2025-05-25", 85],
      ["2025-05-26", 84.5],
      ["2025-05-27", 84],
      ["2025-05-28", 83.5],
      ["2025-05-29", 83],
      ["2025-05-30", 82.5],
      ["2025-05-31", 82],
    ]);
    const result = predictGoalDate(entries, 80);
    expect(result.kind).toBe(GoalPredictionKind.Predicted);
    if (result.kind === GoalPredictionKind.Predicted) {
      expect(result.date.toString()).toBe("2025-06-04");
    }
  });

  it("Predicted: weight-gain scenario toward higher goal", () => {
    const entries = makeEntries([
      ["2025-05-25", 70],
      ["2025-05-26", 70.5],
      ["2025-05-27", 71],
      ["2025-05-28", 71.5],
      ["2025-05-29", 72],
    ]);
    const result = predictGoalDate(entries, 75);
    expect(result.kind).toBe(GoalPredictionKind.Predicted);
    if (result.kind === GoalPredictionKind.Predicted) {
      expect(result.date.toString()).toBe("2025-06-04");
    }
  });

  it("WrongDirection: goal equals current predicted weight (already at goal)", () => {
    // slope +0.5/day from 80; at day 4 (May 29) predicted = 82; goal = 82 → already there
    const trendEntries = makeEntries([
      ["2025-05-25", 80],
      ["2025-05-26", 80.5],
      ["2025-05-27", 81],
      ["2025-05-28", 81.5],
      ["2025-05-29", 82],
    ]);
    const result = predictGoalDate(trendEntries, 82);
    expect(result.kind).toBe(GoalPredictionKind.WrongDirection);
  });

  it("custom lookbackDays is respected: old entries outside the window are excluded", () => {
    const entries = makeEntries([
      // These are older than 7 days from 2025-06-01 (before May 25)
      ["2025-05-01", 90],
      ["2025-05-05", 89],
      ["2025-05-10", 88],
      // These are within 7 days (May 25 onward — cutoff is May 25)
      ["2025-05-26", 80],
      ["2025-05-28", 79.5],
    ]);
    // With lookbackDays=7 only 2 recent entries → InsufficientData
    const result = predictGoalDate(entries, 75, 7);
    expect(result.kind).toBe(GoalPredictionKind.InsufficientData);
  });
});
