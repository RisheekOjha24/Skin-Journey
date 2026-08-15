import { apiRequest, apiRequestWithMeta } from "@/lib/api-client";
import { DashboardSummary, Pagination, Scan, ScanComparison } from "@/types";
import { ScanType } from "@/config/scan.config";

export const scanService = {
  async create(file: File, scanType: ScanType) {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("scanType", scanType);
    return apiRequest<Scan>("/api/scans", {
      method: "POST",
      body: formData,
      isFormData: true,
      timeout: 120_000, // 2 minutes
    });
  },

  async list(params: { page?: number; limit?: number } = {}) {
    return apiRequestWithMeta<Scan[]>("/api/scans", { query: params }).then(
      (r) => ({
        scans: r.data,
        pagination: r.meta?.pagination as Pagination | undefined,
      }),
    );
  },

  getById(id: string) {
    return apiRequest<Scan>(`/api/scans/${id}`);
  },

  compare(beforeId: string, afterId: string) {
    return apiRequest<ScanComparison>("/api/scans/compare", {
      query: { beforeId, afterId },
    });
  },

  dashboard() {
    return apiRequest<DashboardSummary>("/api/scans/dashboard");
  },

  delete(id: string) {
    return apiRequest<{ id: string; deleted: boolean }>(`/api/scans/${id}`, {
      method: "DELETE",
    });
  },

  deleteMany(ids: string[]) {
    return apiRequest<{ deletedIds: string[]; deletedCount: number }>(
      "/api/scans",
      {
        method: "DELETE",
        body: { ids },
      },
    );
  },
};
