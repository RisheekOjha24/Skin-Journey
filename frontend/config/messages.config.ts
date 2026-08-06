export const MESSAGES = {
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Couldn't reach the server. Check your connection and try again.",
    unauthorized: "Your session has expired. Please log in again.",
    invalidCredentials: "That email or password doesn't match our records.",
    emailInUse: "An account with this email already exists.",
    minTwoScansForSummary: "Add at least two scans before generating an AI summary.",
    minOneScanForReport: "Add at least one scan before generating a report.",
    imageRequired: "Please add a photo to continue.",
  },
  success: {
    accountCreated: "Account created. Let's set up your baseline scan.",
    scanSaved: "Scan saved to your timeline.",
    scanDeleted: "Scan deleted.",
    scansDeleted: "Scans deleted.",
    journalSaved: "Journal entry saved.",
    milestoneAdded: "Milestone added to your timeline.",
    summaryGenerated: "New progress summary generated.",
  },
  empty: {
    noScans: {
      title: "No scans yet",
      body: "Your skincare journey starts with a baseline scan. It takes under a minute.",
      cta: "Start baseline scan",
    },
    noJournalEntries: {
      title: "No journal entries yet",
      body: "Log the products and routine changes behind your scans, so patterns are easy to spot later.",
      cta: "Add an entry",
    },
    noMilestones: {
      title: "No milestones yet",
      body: "Mark the moments that might explain a change — a new product, a dermatologist visit, a routine switch.",
      cta: "Add a milestone",
    },
    notEnoughForCompare: {
      title: "Need two scans to compare",
      body: "Once you have a second scan, you can compare any two side by side.",
    },
    notEnoughForSummary: {
      title: "Not enough history yet",
      body: "Once you have two or more scans, Skin Journey can summarize the measurable trend for you.",
    },
  },
} as const;
