"use client";
import * as React from "react";
import { scanService } from "@/services/scan.service";
import { DashboardSummary } from "@/types";
import { ApiClientError } from "@/lib/api-client";

export function useDashboard() {
  const [data, setData] = React.useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanService.dashboard();
      setData(result);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load your dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return { data, isLoading, error, refresh: load };
}
