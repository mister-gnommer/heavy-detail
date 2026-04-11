export const queryKeys = {
  entries: {
    all: ["entries"] as const,
    recent: (days: number) => ["entries", "recent", days] as const,
  },
};
