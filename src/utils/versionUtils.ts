/**
 * Utility functions for checking dataset version compatibility
 */

const DATASET_URL = process.env.DATASET_URL || "https://huggingface.co/datasets";
const DATASET_URL_LAYOUT = (process.env.DATASET_URL_LAYOUT || "auto").toLowerCase();

type DatasetLayout = "hf" | "flat";
type LayoutPreference = DatasetLayout | "auto";

const datasetLayoutCache = new Map<string, DatasetLayout>();

function getLayoutPreference(): LayoutPreference {
  if (DATASET_URL_LAYOUT === "flat" || DATASET_URL_LAYOUT === "hf") {
    return DATASET_URL_LAYOUT as DatasetLayout;
  }
  return "auto";
}

function buildBaseUrl(repoId: string, layout: DatasetLayout): string {
  if (layout === "flat") {
    return `${DATASET_URL}/${repoId}`;
  }
  return `${DATASET_URL}/${repoId}/resolve/main`;
}

function buildInfoUrl(repoId: string, layout: DatasetLayout): string {
  return `${buildBaseUrl(repoId, layout)}/meta/info.json`;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    return await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function resolveDatasetLayout(repoId: string): DatasetLayout {
  const preference = getLayoutPreference();
  if (preference !== "auto") {
    return preference;
  }
  return datasetLayoutCache.get(repoId) || "hf";
}

/**
 * Dataset information structure from info.json
 */
interface DatasetInfo {
  codebase_version: string;
  robot_type: string | null;
  total_episodes: number;
  total_frames: number;
  total_tasks: number;
  chunks_size: number;
  data_files_size_in_mb: number;
  video_files_size_in_mb: number;
  fps: number;
  splits: Record<string, string>;
  data_path: string;
  video_path: string;
  features: Record<string, any>;
}

/**
 * Fetches dataset information from the main revision
 */
export async function getDatasetInfo(repoId: string): Promise<DatasetInfo> {
  try {
    const preference = getLayoutPreference();
    let response: Response | null = null;
    let layoutUsed: DatasetLayout = "hf";

    if (preference === "flat") {
      layoutUsed = "flat";
      response = await fetchWithTimeout(buildInfoUrl(repoId, "flat"));
    } else if (preference === "hf") {
      layoutUsed = "hf";
      response = await fetchWithTimeout(buildInfoUrl(repoId, "hf"));
    } else {
      layoutUsed = "hf";
      response = await fetchWithTimeout(buildInfoUrl(repoId, "hf"));
      if (response.status === 404) {
        layoutUsed = "flat";
        response = await fetchWithTimeout(buildInfoUrl(repoId, "flat"));
      }
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch dataset info: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if it has the required structure
    if (!data.features) {
      throw new Error("Dataset info.json does not have the expected features structure");
    }
    
    datasetLayoutCache.set(repoId, layoutUsed);
    return data as DatasetInfo;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Dataset ${repoId} is not compatible with this visualizer. ` +
      "Failed to read dataset information from the main revision."
    );
  }
}


/**
 * Gets the dataset version by reading the codebase_version from the main revision's info.json
 */
export async function getDatasetVersion(repoId: string): Promise<string> {
  try {
    const datasetInfo = await getDatasetInfo(repoId);
    
    // Extract codebase_version
    const codebaseVersion = datasetInfo.codebase_version;
    if (!codebaseVersion) {
      throw new Error("Dataset info.json does not contain codebase_version");
    }
    
    // Validate that it's a supported version
    const supportedVersions = ["v3.0", "v2.1", "v2.0"];
    if (!supportedVersions.includes(codebaseVersion)) {
      throw new Error(
        `Dataset ${repoId} has codebase version ${codebaseVersion}, which is not supported. ` +
        "This tool only works with dataset versions 3.0, 2.1, or 2.0. " +
        "Please use a compatible dataset version."
      );
    }
    
    return codebaseVersion;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      `Dataset ${repoId} is not compatible with this visualizer. ` +
      "Failed to read dataset information from the main revision."
    );
  }
}

export function buildVersionedUrl(repoId: string, version: string, path: string): string {
  const layout = resolveDatasetLayout(repoId);
  return `${buildBaseUrl(repoId, layout)}/${path}`;
}
