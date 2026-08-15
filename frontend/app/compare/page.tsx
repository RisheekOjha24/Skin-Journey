"use client";
import * as React from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MetricDeltaBadge } from "@/components/common/metric-badge";
import { useScans } from "@/hooks/use-scans";
import { scanService } from "@/services/scan.service";
import { ScanComparison } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { API_CONFIG } from "@/config/api.config";
import { SKIN_METRIC_LABELS, SKIN_METRIC_ICONS, SkinMetric } from "@/config/metrics.config";
import { GitCompareArrows } from "lucide-react";
import { parseUTCDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { CustomSelect } from "@/components/ui/custom-select";

export default function ComparePage() {
  const { scans, isLoading: scansLoading } = useScans();
  const [beforeId, setBeforeId] = React.useState<string>("");
  const [afterId, setAfterId] = React.useState<string>("");
  const [comparison, setComparison] = React.useState<ScanComparison | null>(
    null,
  );
  const [isComparing, setIsComparing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
    if (scans.length >= 2 && !beforeId && !afterId) {
      setBeforeId(scans[0].id);
      setAfterId(scans[scans.length - 1].id);
    }
  }, [scans, beforeId, afterId]);

  const runComparison = React.useCallback(async () => {
    if (!beforeId || !afterId) return;
    setIsComparing(true);
    setError(null);
    try {
      const result = await scanService.compare(beforeId, afterId);
      setComparison(result);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not compare these scans.",
      );
    } finally {
      setIsComparing(false);
    }
  }, [beforeId, afterId]);

  React.useEffect(() => {
    if (beforeId && afterId) runComparison();
  }, [beforeId, afterId, runComparison]);

  if (scansLoading) {
    return (
      <AppShell>
        <Skeleton className="h-96 rounded-card" />
      </AppShell>
    );
  }

  if (scans.length < 2) {
    return (
      <AppShell>
        <PageHeader
          title="Before & After Comparison"
          description="Compare any two scans side by side."
        />
        <EmptyState
          icon={GitCompareArrows}
          title="Need two scans to compare"
          body="Once you have a second scan, you can compare any two side by side."
          ctaLabel="Take a scan"
          onCta={() => router.push(ROUTES.newScan)}
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Before & After Comparison"
        description="Compare any two scans side by side, metric by metric."
      />

      <Card className="mb-6">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <Label>Before</Label>
            <CustomSelect
              className="mt-1.5"
              value={beforeId}
              onValueChange={setBeforeId}
              options={scans.map((s) => ({
                value: s.id,
                label: `${format(parseUTCDate(s.capturedAt), "MMM d, yyyy · h:mm a")} · Score ${s.overallScore ?? "—"}`,
              }))}
            />
          </div>
          <div>
            <Label>After</Label>
            <CustomSelect
              className="mt-1.5"
              value={afterId}
              onValueChange={setAfterId}
              options={scans.map((s) => ({
                value: s.id,
                label: `${format(parseUTCDate(s.capturedAt), "MMM d, yyyy · h:mm a")} · Score ${s.overallScore ?? "—"}`,
              }))}
            />
          </div>
        </CardContent>
      </Card>

      {isComparing && <Skeleton className="h-96 rounded-card" />}
      {!isComparing && error && (
        <ErrorState message={error} onRetry={runComparison} />
      )}

      {!isComparing && comparison && (
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {[comparison.before, comparison.after].map((scan, i) => (
              <Card key={scan.id} className="overflow-hidden">
                <img
                  src={`${API_CONFIG.baseUrl}${scan.imageUrl}`}
                  alt={i === 0 ? "Before" : "After"}
                  className="aspect-square w-full object-cover"
                />
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {i === 0 ? "Before" : "After"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(parseUTCDate(scan.capturedAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <p className="font-display text-2xl font-medium">
                    {scan.overallScore ?? "—"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {comparison.overallScoreDelta !== null && (
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <p className="font-medium">Overall score change</p>
                <p
                  className={`font-display text-2xl font-medium ${comparison.overallScoreDelta >= 0 ? "text-positive" : "text-negative"}`}
                >
                  {comparison.overallScoreDelta > 0 ? "+" : ""}
                  {comparison.overallScoreDelta}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Metric-by-metric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {comparison.metricComparison.map((c) => {
                const MetricIcon = SKIN_METRIC_ICONS[c.metric as SkinMetric];
                return (
                  <div
                    key={c.metric}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {MetricIcon && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <MetricIcon className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {SKIN_METRIC_LABELS[c.metric as SkinMetric]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.before ?? "—"} → {c.after ?? "—"}
                        </p>
                      </div>
                    </div>
                    <MetricDeltaBadge comparison={c} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
