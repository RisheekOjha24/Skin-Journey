"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MilestoneForm } from "@/components/milestones/milestone-form";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { BulkDeleteBar } from "@/components/scan/bulk-delete-bar";
import { DeleteMilestoneDialog } from "@/components/milestones/delete-milestone-dialog";
import { useMilestones } from "@/hooks/use-milestones";
import { MESSAGES } from "@/config/messages.config";
import { Flag } from "lucide-react";

export default function MilestonesPage() {
  const { milestones, isLoading, error, refresh, createMilestone, deleteMilestone, deleteMilestones } = useMilestones();

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
      await deleteMilestone(pendingSingleId);
      setSelectedIds((prev) => {
        const copy = new Set(prev);
        copy.delete(pendingSingleId);
        return copy;
      });
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
      await deleteMilestones(Array.from(selectedIds));
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
        title="Milestones"
        description="Mark the moments that might explain a change in your data. Select milestones to bulk delete."
        actions={<MilestoneForm onSubmit={createMilestone} />}
      />

      {isLoading && <Skeleton className="h-64 rounded-card" />}
      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && milestones.length === 0 && (
        <EmptyState icon={Flag} title={MESSAGES.empty.noMilestones.title} body={MESSAGES.empty.noMilestones.body} />
      )}

      {!isLoading && !error && milestones.length > 0 && (
        <MilestoneList
          milestones={milestones}
          onDelete={(id) => setPendingSingleId(id)}
          selectedIds={selectedIds}
          onSelectChange={toggleSelected}
        />
      )}

      <BulkDeleteBar
        selectedCount={selectedIds.size}
        itemLabel="milestone"
        onDelete={() => setBulkDialogOpen(true)}
        onClear={() => setSelectedIds(new Set())}
      />

      <DeleteMilestoneDialog
        open={pendingSingleId !== null}
        onOpenChange={(open) => !open && setPendingSingleId(null)}
        count={1}
        isDeleting={isDeleting}
        onConfirm={handleSingleDeleteConfirm}
      />

      <DeleteMilestoneDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        count={selectedIds.size}
        isDeleting={isDeleting}
        onConfirm={handleBulkDeleteConfirm}
      />
    </AppShell>
  );
}
