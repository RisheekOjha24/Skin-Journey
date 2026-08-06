import { apiDownload } from "@/lib/api-client";

export const reportService = {
  /**
   * PDF downloads use the shared Axios client with `responseType:
   * "blob"` via `apiDownload`, which also decodes a JSON error body
   * back into the same ApiClientError shape as every other request if
   * the server rejects the request before streaming any PDF bytes.
   */
  downloadDermatologistReport(): Promise<Blob> {
    return apiDownload("/api/reports/dermatologist");
  },
};
