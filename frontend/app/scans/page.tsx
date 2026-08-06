"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScanCard } from "@/components/scan/scan-card";
import { DeleteScanDialog } from "@/components/scan/delete-scan-dialog";
import { BulkDeleteBar } from "@/components/scan/bulk-delete-bar";
import { useScans } from "@/hooks/use-scans";
import { MESSAGES } from "@/config/messages.config";
import { ROUTES } from "@/config/routes.config";
import { Images, Camera } from "lucide-react";

export default function ScansPage() {
  const { scans, isLoading, error, refresh, deleteScan, deleteScans } = useScans();
  const router = useRouter();

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
      await deleteScan(pendingSingleId);
      setPendingSingleId(null);
    } catch {
      // error toast already handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await deleteScans(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDialogOpen(false);
    } catch {
      // error toast already handled in the hook
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="All Scans"
        description="Every scan you've recorded, in one place. Select any number to delete at once."
        actions={
          <Button asChild className="gap-2">
            <a href={ROUTES.newScan}>
              <Camera className="h-4 w-4" />
              New Scan
            </a>
          </Button>
        }
      />

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-card" />
          ))}
        </div>
      )}

      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && scans.length === 0 && (
        <EmptyState
          icon={Images}
          title={MESSAGES.empty.noScans.title}
          body={MESSAGES.empty.noScans.body}
          ctaLabel={MESSAGES.empty.noScans.cta}
          onCta={() => router.push(ROUTES.newScan)}
        />
      )}

      {!isLoading && !error && scans.length > 0 && (
        <div className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {scans
            .slice()
            .reverse()
            .map((scan) => (
              <ScanCard
                key={scan.id}
                scan={scan}
                selected={selectedIds.has(scan.id)}
                onSelectChange={(next) => toggleSelected(scan.id, next)}
                onDeleteRequest={() => setPendingSingleId(scan.id)}
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
