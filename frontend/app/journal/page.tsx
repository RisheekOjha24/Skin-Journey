"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { useJournal } from "@/hooks/use-journal";
import { MESSAGES } from "@/config/messages.config";
import { NotebookPen } from "lucide-react";

export default function JournalPage() {
  const { entries, isLoading, error, refresh, createEntry, deleteEntry } = useJournal();

  return (
    <AppShell>
      <PageHeader
        title="Journal"
        description="The routine and lifestyle context behind your scans."
        actions={<JournalEntryForm onSubmit={createEntry} />}
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      )}

      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && entries.length === 0 && (
        <EmptyState icon={NotebookPen} title={MESSAGES.empty.noJournalEntries.title} body={MESSAGES.empty.noJournalEntries.body} />
      )}

      {!isLoading && !error && entries.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
