import { apiRequest } from "@/lib/api-client";
import { Milestone } from "@/types";
import { MilestoneCategory } from "@/config/milestones.config";

export interface MilestoneInput {
  category: MilestoneCategory;
  title: string;
  description?: string;
  occurredAt?: string;
}

export const milestoneService = {
  create(input: MilestoneInput) {
    return apiRequest<Milestone>("/api/milestones", { method: "POST", body: input });
  },
  list() {
    return apiRequest<Milestone[]>("/api/milestones");
  },
  delete(id: string) {
    return apiRequest<{ deleted: boolean }>(`/api/milestones/${id}`, { method: "DELETE" });
  },
  bulkDelete(ids: string[]) {
    return apiRequest<{ deleted: boolean; count: number }>("/api/milestones", { method: "DELETE", body: { ids } });
  },
};
