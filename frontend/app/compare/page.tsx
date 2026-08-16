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
import { GitCompareArrows, ArrowRight } from "lucide-react";
import { parseUTCDate } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes.config";
import { CustomSelect } from "@/components/ui/custom-select";
import { MetricInfoTooltip } from "@/components/scan/metric-calculation-info";
import { CompareSummary } from "@/components/scan/compare-summary";
import { ScanImageViewer } from "@/components/scan/scan-image-viewer";

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
                <ScanImageViewer
                  src={`${API_CONFIG.baseUrl}${scan.imageUrl}`}
                  alt={i === 0 ? "Before Scan" : "After Scan"}
                  title={i === 0 ? "Before Scan" : "After Scan"}
                />
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {i === 0 ? "Before Scan" : "After Scan"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseUTCDate(scan.capturedAt), "MMM d, yyyy · h:mm a")}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-right divide-x divide-border/60">
                    {scan.skinAge !== undefined && scan.skinAge !== null && (
                      <div className="space-y-0.5 pr-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Skin Age</p>
                        <p className="font-display text-xl font-semibold text-primary">{scan.skinAge} <span className="text-[10px] font-normal text-muted-foreground">yrs</span></p>
                      </div>
                    )}
                    <div className="space-y-0.5 pl-4">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Score</p>
                      <p className="font-display text-xl font-semibold text-foreground">
                        {scan.overallScore ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {comparison.overallScoreDelta !== null && (
            <CompareSummary comparison={comparison} />
          )}

          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold tracking-tight">Metric Breakdown & Analysis</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Detailed comparison between scans across all key skin parameters
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {comparison.metricComparison.map((c) => {
                  const MetricIcon = SKIN_METRIC_ICONS[c.metric as SkinMetric];
                  const beforeVal = c.before ?? "—";
                  const afterVal = c.after ?? "—";

                  return (
                    <div
                      key={c.metric}
                      className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/60 p-4 transition-all duration-200 hover:border-border hover:bg-card hover:shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          {MetricIcon && (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <MetricIcon className="h-4.5 w-4.5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-display text-base font-semibold text-foreground">
                                {SKIN_METRIC_LABELS[c.metric as SkinMetric]}
                              </span>
                              <MetricInfoTooltip type="metric" metric={c.metric as SkinMetric} />
                            </div>
                          </div>
                        </div>
                        <MetricDeltaBadge comparison={c} />
                      </div>

                      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3.5 py-2 mt-1">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Before</span>
                          <span className="font-mono text-base font-medium text-foreground">{beforeVal}</span>
                        </div>

                        <div className="flex items-center px-2 text-primary/80">
                          <ArrowRight className="h-6 w-6 stroke-[2.5]" />
                        </div>

                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">After</span>
                          <span className="font-mono text-base font-semibold text-foreground">{afterVal}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
