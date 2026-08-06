"use client";
import * as React from "react";
import { toast } from "sonner";
import { scanService } from "@/services/scan.service";
import { Scan } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { MESSAGES } from "@/config/messages.config";

export function useScans() {
  const [scans, setScans] = React.useState<Scan[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await scanService.list({ limit: 100 });
      setScans(result.scans);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load scans.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const deleteScan = React.useCallback(async (id: string) => {
    const previous = scans;
    setScans((prev) => prev.filter((s) => s.id !== id));
    try {
      await scanService.delete(id);
      toast.success(MESSAGES.success.scanDeleted);
    } catch (err) {
      setScans(previous);
      toast.error(err instanceof ApiClientError ? err.message : MESSAGES.errors.generic);
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans]);

  const deleteScans = React.useCallback(async (ids: string[]) => {
    const previous = scans;
    setScans((prev) => prev.filter((s) => !ids.includes(s.id)));
    try {
      await scanService.deleteMany(ids);
      toast.success(MESSAGES.success.scansDeleted);
    } catch (err) {
      setScans(previous);
      toast.error(err instanceof ApiClientError ? err.message : MESSAGES.errors.generic);
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scans]);

  return { scans, isLoading, error, refresh: load, deleteScan, deleteScans };
}
