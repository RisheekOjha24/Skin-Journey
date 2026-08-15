"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { JournalEntryForm } from "@/components/journal/journal-entry-form";
import { JournalEntryCard } from "@/components/journal/journal-entry-card";
import { BulkDeleteBar } from "@/components/scan/bulk-delete-bar";
import { DeleteScanDialog } from "@/components/scan/delete-scan-dialog";
import { useJournal } from "@/hooks/use-journal";
import { MESSAGES } from "@/config/messages.config";
import { NotebookPen } from "lucide-react";

export default function JournalPage() {
  const { entries, isLoading, error, refresh, createEntry, deleteEntry, deleteEntries } = useJournal();

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [pendingSingleId, setPendingSingleId] = React.useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const toggleSelected = (id: string, next: boolean) => {
    setSelectedIds((prev) => {
      const copy = new Set(prev);
      if (next) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  };

  const handleSingleDeleteConfirm = async () => {
    if (!pendingSingleId) return;
    setIsDeleting(true);
    try {
      await deleteEntry(pendingSingleId);
      setPendingSingleId(null);
    } catch {
      // error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteEntries(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDialogOpen(false);
    } catch {
      // error handled in hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Journal"
        description="The routine and lifestyle context behind your scans. Select entries to bulk delete."
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
        <div className="grid gap-4 pb-20 sm:grid-cols-2">
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              selected={selectedIds.has(entry.id)}
              onSelectChange={(next) => toggleSelected(entry.id, next)}
              onDelete={() => setPendingSingleId(entry.id)}
            />
          ))}
        </div>
      )}

      <BulkDeleteBar
        selectedCount={selectedIds.size}
        onDelete={() => setBulkDialogOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

      <DeleteScanDialog
        open={pendingSingleId !== null}
        onOpenChange={(open) => !open && setPendingSingleId(null)}
        count={1}
        isDeleting={isDeleting}
        onConfirm={handleSingleDeleteConfirm}
      />

      <DeleteScanDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        count={selectedIds.size}
        isDeleting={isDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </AppShell>
  );
}
