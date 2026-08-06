"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { MilestoneForm } from "@/components/milestones/milestone-form";
import { MilestoneList } from "@/components/milestones/milestone-list";
import { useMilestones } from "@/hooks/use-milestones";
import { MESSAGES } from "@/config/messages.config";
import { Flag } from "lucide-react";

export default function MilestonesPage() {
  const { milestones, isLoading, error, refresh, createMilestone, deleteMilestone } = useMilestones();

  return (
    <AppShell>
      <PageHeader
        title="Milestones"
        description="Mark the moments that might explain a change in your data."
        actions={<MilestoneForm onSubmit={createMilestone} />}
      />

      {isLoading && <Skeleton className="h-64 rounded-card" />}
      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && milestones.length === 0 && (
        <EmptyState icon={Flag} title={MESSAGES.empty.noMilestones.title} body={MESSAGES.empty.noMilestones.body} />
      )}

      {!isLoading && !error && milestones.length > 0 && (
        <MilestoneList milestones={milestones} onDelete={deleteMilestone} />
      )}
    </AppShell>
  );
}
