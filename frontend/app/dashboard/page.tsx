"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCard } from "@/components/dashboard/score-card";
import { NextScanCard } from "@/components/dashboard/next-scan-card";
import { TimelineRibbon } from "@/components/dashboard/timeline-ribbon";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { useDashboard } from "@/hooks/use-dashboard";
import { useScans } from "@/hooks/use-scans";
import { useMilestones } from "@/hooks/use-milestones";
import { useAuth } from "@/lib/auth-context";
import { MESSAGES } from "@/config/messages.config";
import { Camera } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error, refresh } = useDashboard();
  const { scans } = useScans();
  const { milestones } = useMilestones();
  const router = useRouter();

  return (
    <AppShell>
      <PageHeader
        title={`Welcome back${user ? `, ${user.displayName.split(" ")[0]}` : ""}`}
        description="Here's the objective view of how your skin has changed."
      />

      {isLoading && (
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-40 rounded-card md:col-span-1" />
          <Skeleton className="h-40 rounded-card md:col-span-1" />
          <Skeleton className="h-40 rounded-card md:col-span-1" />
          <Skeleton className="h-56 rounded-card md:col-span-3" />
        </div>
      )}

      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && data && data.totalScans === 0 && (
        <EmptyState
          icon={Camera}
          title={MESSAGES.empty.noScans.title}
          body={MESSAGES.empty.noScans.body}
          ctaLabel={MESSAGES.empty.noScans.cta}
          onCta={() => router.push(ROUTES.newScan)}
        />
      )}

      {!isLoading && !error && data && data.totalScans > 0 && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <ScoreCard
              score={data.latestScan?.overallScore ?? null}
              trend={data.trend}
              totalScans={data.totalScans}
            />
            <NextScanCard
              nextRecommendedScanDate={data.nextRecommendedScanDate}
            />
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Milestones logged
                </p>
                <p className="mt-2 font-display text-5xl font-medium tabular-nums">
                  {milestones.length}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Context for what might explain a change
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Skin Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <TimelineRibbon
                scoreHistory={data.scoreHistory}
                milestones={milestones}
              />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivity
              scans={scans.slice(0, 6)}
              milestones={milestones.slice(0, 6)}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Every claim, sourced
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Skin Journey is built on measured results, not estimates. Every
                score shown on this dashboard comes directly from the YouCam
                Skin Analysis API after analyzing the photo captured during that
                scan. We never predict, simulate, or generate scores, each value
                reflects a real analysis of that specific image.
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
