"use client";
import * as React from "react";
import { summaryService } from "@/services/summary.service";
import { ProgressSummary } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";
import { MESSAGES } from "@/config/messages.config";

export function useSummary() {
  const [summary, setSummary] = React.useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await summaryService.getLatest();
      setSummary(result);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load summary.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const generate = React.useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await summaryService.generate();
      setSummary(result);
      toast.success(MESSAGES.success.summaryGenerated);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : MESSAGES.errors.generic;
      setError(message);
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { summary, isLoading, isGenerating, error, generate };
}
