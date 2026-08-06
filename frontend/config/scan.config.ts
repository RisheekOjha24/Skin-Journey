export const SCAN_TYPE = {
  BASELINE: "baseline",
  WEEKLY: "weekly",
  MANUAL: "manual",
} as const;

export type ScanType = (typeof SCAN_TYPE)[keyof typeof SCAN_TYPE];

export const SCAN_TYPE_LABELS: Record<ScanType, string> = {
  baseline: "Baseline",
  weekly: "Weekly Scan",
  manual: "Manual Scan",
};

export const SCAN_CAPTURE_TIPS = [
  "Use the same room and light source every time — natural daylight near a window works best.",
  "Hold the camera at arm's length, straight on, at the same distance each time.",
  "Remove makeup and keep a neutral expression for consistent, comparable results.",
  "Scan on the same day each week so your trend line reflects real change, not routine drift.",
] as const;

export const SCAN_REMINDER_INTERVAL_DAYS = 7;

export const SCAN_DELETE_COPY = {
  single: {
    title: "Delete this scan?",
    description:
      "This permanently removes the scan, its photo, and its measurements from your timeline. This action cannot be undone.",
  },
  bulk: (count: number) => ({
    title: `Delete ${count} scan${count === 1 ? "" : "s"}?`,
    description: `This permanently removes ${count === 1 ? "this scan" : `these ${count} scans`}, ${
      count === 1 ? "its" : "their"
    } photos, and ${count === 1 ? "its" : "their"} measurements from your timeline. This action cannot be undone.`,
  }),
} as const;
