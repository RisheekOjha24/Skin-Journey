"use client";
import * as React from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreTimelineChart } from "@/components/charts/score-timeline-chart";
import { MetricTrendChart } from "@/components/charts/metric-trend-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import { SKIN_METRICS, SKIN_METRIC_LABELS, SkinMetric } from "@/config/metrics.config";
import { MESSAGES } from "@/config/messages.config";
import { LineChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";

export default function TimelinePage() {
  const { data, isLoading, error, refresh } = useDashboard();
  const router = useRouter();

  return (
    <AppShell>
      <PageHeader title="Skin Progress Timeline" description="Every measured metric, across every scan you've taken." />

      {isLoading && <Skeleton className="h-96 rounded-card" />}
      {!isLoading && error && <ErrorState message={error} onRetry={refresh} />}

      {!isLoading && !error && data && data.scoreHistory.length === 0 && (
        <EmptyState
          icon={LineChart}
          title={MESSAGES.empty.noScans.title}
          body={MESSAGES.empty.noScans.body}
          ctaLabel={MESSAGES.empty.noScans.cta}
          onCta={() => router.push(ROUTES.newScan)}
        />
      )}

      {!isLoading && !error && data && data.scoreHistory.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ScoreTimelineChart data={data.scoreHistory} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {SKIN_METRICS.map((metric) => {
              const series = data.metricSeries[metric];
              if (!series || series.length === 0) return null;
              return (
                <Card key={metric}>
                  <CardHeader>
                    <CardTitle className="text-sm">{SKIN_METRIC_LABELS[metric as SkinMetric]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricTrendChart metric={metric as SkinMetric} data={series} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </AppShell>
  );
}
