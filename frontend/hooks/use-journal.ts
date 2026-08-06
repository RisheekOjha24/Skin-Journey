"use client";
import * as React from "react";
import { journalService, JournalEntryInput } from "@/services/journal.service";
import { JournalEntry } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";
import { MESSAGES } from "@/config/messages.config";

export function useJournal() {
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await journalService.list({ limit: 50 });
      setEntries(result.entries);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load journal entries.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const createEntry = React.useCallback(
    async (input: JournalEntryInput) => {
      const entry = await journalService.create(input);
      setEntries((prev) => [entry, ...prev]);
      toast.success(MESSAGES.success.journalSaved);
      return entry;
    },
    []
  );

  const deleteEntry = React.useCallback(async (id: string) => {
    await journalService.delete(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return { entries, isLoading, error, refresh: load, createEntry, deleteEntry };
}
