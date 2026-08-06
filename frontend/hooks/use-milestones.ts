"use client";
import * as React from "react";
import { milestoneService, MilestoneInput } from "@/services/milestone.service";
import { Milestone } from "@/types";
import { ApiClientError } from "@/lib/api-client";
import { toast } from "sonner";
import { MESSAGES } from "@/config/messages.config";

export function useMilestones() {
  const [milestones, setMilestones] = React.useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await milestoneService.list();
      setMilestones(result);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load milestones.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const createMilestone = React.useCallback(async (input: MilestoneInput) => {
    const milestone = await milestoneService.create(input);
    setMilestones((prev) => [...prev, milestone].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)));
    toast.success(MESSAGES.success.milestoneAdded);
    return milestone;
  }, []);

  const deleteMilestone = React.useCallback(async (id: string) => {
    await milestoneService.delete(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { milestones, isLoading, error, refresh: load, createMilestone, deleteMilestone };
}
