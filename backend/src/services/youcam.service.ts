import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import axios, { AxiosInstance } from "axios";
import { env } from "../config/env";
import { logger } from "../utils/logger.util";
import { ApiError } from "../utils/api-error.util";
import { toExternalApiError } from "../utils/http-error.util";
import { createHttpClient } from "../lib/http-client";
import { SKIN_METRICS, SkinMetric } from "../config/constants";
import { NormalizedSkinAnalysis } from "../types/youcam.types";

const SKIN_ANALYSIS_ACTIONS = [
  "wrinkle",
  "firmness",
  "acne",
  "moisture",
  "eye_bag",
  "dark_circle_v2",
  "age_spot",
  "radiance",
  "redness",
  "oiliness",
  "pore",
  "texture",
  "skin_type",
] as const;
export const POLL_INTERVAL_MS = 2_000;
export const POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
export const YOUCAM_POLL_REQUEST_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Lazily constructed so the auth header always reflects the current
 * env (useful in tests / hot-reload) without paying instance-creation
 * cost when the app is running in mock mode and this is never called.
 */
let _youcamClient: AxiosInstance | null = null;
function getYouCamClient(): AxiosInstance {
  if (!_youcamClient) {
    _youcamClient = createHttpClient({
      baseURL: env.YOUCAM_API_BASE_URL,
      defaultHeaders: {
        Authorization: `Bearer ${env.YOUCAM_API_KEY}`,
        ...(env.YOUCAM_CLIENT_ID
          ? { "X-Client-Id": env.YOUCAM_CLIENT_ID }
          : {}),
      },
    });
  }
  return _youcamClient;
}

interface FileApiResponse {
  status: number;
  data: {
    files: {
      file_id: string;
      file_name: string;
      content_type: string;
      requests: {
        method: string;
        url: string;
        headers: Record<string, string>;
      }[];
    }[];
  };
}

interface TaskCreateResponse {
  status: number;
  data: { task_id: string };
}

interface TaskPollResponse {
  status: number;
  data: {
    task_status: "running" | "success" | "error";
    error?: string;
    error_message?: string;
    // Perfect Corp's result payload shape varies per requested
    // dst_action and isn't formally typed in their public docs, so
    // this stays a loosely-typed record; `mapYouCamResultToMetrics`
    // below is the single place that reads out of it.
    results?: Record<string, unknown>;
  };
}

/**
 * Step 1: request a pre-signed upload URL + file_id, then PUT the raw
 * image bytes to it directly.
 *
 * Note: the PUT below deliberately uses a bare `axios.put` call rather
 * than the shared YouCam client — pre-signed upload URLs are already
 * authenticated via their query-string signature, and attaching our
 * API bearer token or an unexpected header can invalidate that
 * signature and get the upload rejected.
 */
async function uploadImage(imagePath: string): Promise<string> {
  const imageBuffer = fs.readFileSync(imagePath);
  const fileName = path.basename(imagePath);
  const contentType = fileName.endsWith(".png") ? "image/png" : "image/jpeg";

  let fileEntry: FileApiResponse["data"]["files"][number] | undefined;

  try {
    const fileApiRes = await getYouCamClient().post<FileApiResponse>(
      "/s2s/v2.0/file/skin-analysis",
      {
        files: [
          {
            content_type: contentType,
            file_name: fileName,
            file_size: imageBuffer.byteLength,
          },
        ],
      },
    );

    fileEntry = fileApiRes.data.data?.files?.[0];
  } catch (error) {
    throw toExternalApiError(error, "YouCam file upload");
  }

  const uploadRequest = fileEntry?.requests?.[0];

  if (!fileEntry?.file_id || !uploadRequest?.url) {
    logger.error("YouCam File API returned an unexpected shape", {
      fileEntry,
    });

    throw ApiError.externalApi(
      "The skin analysis service returned an unexpected response.",
    );
  }

  try {
    await axios({
      url: uploadRequest.url,
      method: uploadRequest.method,
      headers: {
        ...uploadRequest.headers,
        "Content-Type": contentType,
      },
      data: imageBuffer,
      timeout: env.EXTERNAL_API_TIMEOUT_MS,
    });
  } catch (error) {
    throw toExternalApiError(error, "YouCam pre-signed image upload");
  }

  return fileEntry.file_id;
}

/** Step 2: start the analysis task against the uploaded file. */
async function createSkinAnalysisTask(fileId: string): Promise<string> {
  let response: TaskCreateResponse;

  try {
    const res = await getYouCamClient().post<TaskCreateResponse>(
      "/s2s/v2.0/task/skin-analysis",
      {
        src_file_id: fileId,
        dst_actions: SKIN_ANALYSIS_ACTIONS,
        miniserver_args: {
          enable_mask_overlay: true,
        },
        format: "json",
      },
    );

    response = res.data;
  } catch (error) {
    throw toExternalApiError(error, "YouCam skin analysis task creation");
  }

  const taskId = response.data?.task_id;

  if (!taskId) {
    logger.error("YouCam task creation returned an unexpected shape", {
      response,
    });

    throw ApiError.externalApi(
      "The skin analysis service returned an unexpected response.",
    );
  }

  return taskId;
}

/** Step 3: poll until the task completes, fails, or we time out. */
async function pollSkinAnalysisTask(
  taskId: string,
): Promise<TaskPollResponse["data"]["results"]> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    let taskData: TaskPollResponse["data"];
    try {
      const res = await getYouCamClient().get<TaskPollResponse>(
        `/s2s/v2.0/task/skin-analysis/${taskId}`,
        {
          timeout: YOUCAM_POLL_REQUEST_TIMEOUT_MS,
        },
      );
      taskData = res.data.data;
      console.log(
        "🚀 ~ pollSkinAnalysisTask ~ taskData:",
        JSON.stringify(taskData, null, 2),
      );
    } catch (error) {
      throw toExternalApiError(error, "YouCam skin analysis task polling");
    }

    if (taskData.task_status === "success") {
      return taskData.results ?? {};
    }

    if (taskData.task_status === "error") {
      logger.error("YouCam task reported an error", {
        error: taskData.error,
        errorMessage: taskData.error_message,
      });
      if (taskData.error === "error_src_face_too_small") {
        throw ApiError.externalApi(
          "Please upload a close-up photo where your face fills more of the frame.",
        );
      }

      if (taskData.error === "error_below_min_image_size") {
        throw ApiError.externalApi(
          "Please upload a higher-resolution, close-up face image. Ensure the face occupies at least 80% of the image width for accurate skin analysis.",
        );
      }

      throw ApiError.externalApi(
        taskData.error_message ||
          "The skin analysis engine could not process this photo.",
      );
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  throw ApiError.externalApi(
    "Skin analysis is taking longer than expected. Please try again.",
  );
}

/**
 * Maps Perfect Corp's raw `hd_*` result fields onto Skin Journey's
 * internal SkinMetric keys. See the file header for which fields are
 * confirmed vs. inferred by naming convention.
 */
function mapYouCamResultToMetrics(
  results: Record<string, any>,
): Partial<Record<SkinMetric, number>> {
  const metrics: Partial<Record<SkinMetric, number>> = {};

  if (!Array.isArray(results.output)) {
    return metrics;
  }

  const byType = Object.fromEntries(
    results.output.map((item: any) => [item.type, item]),
  );

  const getUiScore = (type: string): number | undefined => {
    const score = byType[type]?.ui_score;
    return typeof score === "number" ? score : undefined;
  };

  metrics.acne = getUiScore("acne");
  metrics.moisture = getUiScore("moisture");
  metrics.pores = getUiScore("pore");
  metrics.texture = getUiScore("texture");
  metrics.radiance = getUiScore("radiance");

  // Optional: only if these actions are requested in the future.
  metrics.wrinkles = getUiScore("wrinkle");
  metrics.redness = getUiScore("redness");
  metrics.oiliness = getUiScore("oiliness");
  metrics.darkSpots = getUiScore("age_spot");
  metrics.darkCircles = getUiScore("dark_circle_v2");

  return Object.fromEntries(
    Object.entries(metrics).filter(([, value]) => value !== undefined),
  ) as Partial<Record<SkinMetric, number>>;
}

function extractSkinAge(results: Record<string, any>): number | null {
  if (Array.isArray(results.output)) {
    const item = results.output.find((i: any) => i.type === "skin_age");
    if (item && typeof item.score === "number") return item.score;
    if (item && typeof item.ui_score === "number") return item.ui_score;
  }
  if (typeof results.skin_age === "number") return results.skin_age;
  return null;
}

async function callLiveApi(imagePath: string): Promise<NormalizedSkinAnalysis> {
  const fileId = await uploadImage(imagePath);
  const taskId = await createSkinAnalysisTask(fileId);
  const results = await pollSkinAnalysisTask(taskId);

  if (!results) {
    throw ApiError.externalApi(
      "The skin analysis service returned no results.",
    );
  }

  return {
    metrics: mapYouCamResultToMetrics(results),
    skinAge: extractSkinAge(results),
    overlayImageUrl:
      (results.url as string) ?? (results.dst_url as string) ?? null,
    rawResponse: results,
  };
}

function callMockApi(imagePath: string): NormalizedSkinAnalysis {
  const fileBuffer = fs.readFileSync(imagePath);
  const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

  // Derive stable pseudo-scores from the hash so repeated analysis of
  // the exact same photo is reproducible, and different photos differ.
  const metrics: Partial<Record<SkinMetric, number>> = {};
  SKIN_METRICS.forEach((metric, index) => {
    const segment = hash.slice(index * 4, index * 4 + 4);
    const value = parseInt(segment, 16) % 101; // 0-100
    metrics[metric] = value;
  });

  const mockSkinAge = 20 + (parseInt(hash.slice(0, 2), 16) % 25);

  logger.info("YouCam mock mode: generated deterministic mock analysis", {
    imagePath,
  });

  return {
    metrics,
    skinAge: mockSkinAge,
    overlayImageUrl: null,
    rawResponse: {
      mock: true,
      note: "YOUCAM_MOCK_MODE=true — no live API call was made. Set a real YOUCAM_API_KEY and YOUCAM_MOCK_MODE=false to use live scores.",
      derivedFromHash: hash.slice(0, 12),
    },
  };
}

export const youcamService = {
  async analyzeSkin(imagePath: string): Promise<NormalizedSkinAnalysis> {
    if (env.YOUCAM_MOCK_MODE || !env.YOUCAM_API_KEY) {
      return callMockApi(imagePath);
    }

    try {
      return await callLiveApi(imagePath);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error("Unexpected error calling YouCam API", {
        error: (error as Error).message,
      });
      throw ApiError.externalApi("Could not reach the skin analysis service.");
    }
  },
};
