export const JOURNAL_FIELD_LABELS = {
  productsUsed: "Products used",
  routineMorning: "Morning routine",
  routineEvening: "Evening routine",
  waterIntakeLiters: "Water intake (liters)",
  sleepHours: "Sleep (hours)",
  dietNotes: "Diet notes",
  notes: "Additional notes",
} as const;

export const JOURNAL_PLACEHOLDERS = {
  productsUsed: "e.g. Niacinamide serum, SPF 50, retinol cream",
  routineMorning: "Cleanser, vitamin C serum, moisturizer, SPF...",
  routineEvening: "Double cleanse, retinol, night cream...",
  dietNotes: "Any dietary changes worth noting this week",
  notes: "Anything else worth remembering about this week",
} as const;

export const JOURNAL_DELETE_COPY = {
  single: {
    title: "Delete journal entry?",
    description:
      "This permanently removes this journal entry from your timeline. This action cannot be undone.",
  },
  bulk: (count: number) => ({
    title: `Delete ${count} journal entries?`,
    description: `This permanently removes ${count} selected journal entries from your timeline. This action cannot be undone.`,
  }),
} as const;
