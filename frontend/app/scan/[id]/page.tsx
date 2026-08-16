"use client";
import * as React from "react";
import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/common/page-header";
import { ErrorState } from "@/components/common/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricBreakdown } from "@/components/scan/metric-breakdown";
import { MetricInfoTooltip } from "@/components/scan/metric-calculation-info";
import { scanService } from "@/services/scan.service";
import { ScanImageViewer } from "@/components/scan/scan-image-viewer";
import { Scan } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { SCAN_TYPE_LABELS } from "@/config/scan.config";
import { API_CONFIG } from "@/config/api.config";
import { parseUTCDate } from "@/lib/utils";

export default function ScanDetailPage({ params }: { params: { id: string } }) {
  const [scan, setScan] = React.useState<Scan | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanService.getById(params.id);
      setScan(result);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err.message
          : "Could not load this scan.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <AppShell>
      <PageHeader
        title="Scan Detail"
        description="Full breakdown from this scan's YouCam analysis."
      />

      {isLoading && <Skeleton className="h-96 rounded-card" />}
      {!isLoading && error && <ErrorState message={error} onRetry={load} />}

      {!isLoading && scan && (
        <div className="grid gap-6 md:grid-cols-[1fr_1.3fr]">
          <ScanImageViewer
            src={`${API_CONFIG.baseUrl}${scan.imageUrl}`}
            alt="Scan Detail"
            title={`Scan Detail — ${format(parseUTCDate(scan.capturedAt), "MMMM d, yyyy")}`}
          />
          <div className="space-y-6">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <Badge variant="secondary">
                    {SCAN_TYPE_LABELS[scan.scanType]}
                  </Badge>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {format(
                      parseUTCDate(scan.capturedAt),
                      "EEEE, MMMM d, yyyy 'at' h:mm a",
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-8 border-l border-border/60 pl-6">
                  {scan.skinAge !== undefined && scan.skinAge !== null && (
                    <div className="text-left space-y-0.5">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Skin Age
                      </p>
                      <p className="font-display text-3xl font-semibold text-primary">
                        {scan.skinAge}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          years
                        </span>
                      </p>
                    </div>
                  )}
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Overall Score
                      </p>
                      <MetricInfoTooltip type="overall" />
                    </div>
                    <p className="font-display text-3xl font-semibold text-foreground">
                      {scan.overallScore ?? "—"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metric Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <MetricBreakdown metrics={scan.metrics} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
