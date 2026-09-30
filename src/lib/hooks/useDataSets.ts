import { useQuery } from "@tanstack/react-query";
import api from "./../axios";
import type { DownloadRequest, DownloadResult } from "@/types/exports";
import { USE_EXPORT_MOCKS } from "./useExports";

/**
 * Pull the filename out of a Content-Disposition header.
 * Handles RFC 5987 `filename*=UTF-8''...`, quoted and bare `filename=`.
 */
export const filenameFromContentDisposition = (
  header: string | null | undefined
): string | null => {
  if (!header) return null;

  const star = /filename\*\s*=\s*(?:[\w-]+)?'[^']*'([^;]+)/i.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // fall through to the plain form
    }
  }

  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/i.exec(header);
  const name = (plain?.[2] ?? plain?.[1])?.trim();
  if (!name) return null;
  // Never let a header write outside the downloads folder.
  return name.replace(/[/\\]/g, "_");
};

const fallbackFilename = (
  { source, slug }: DownloadRequest,
  contentType: string | undefined
) => {
  const base = (slug || source).trim().replace(/[^\w-]+/g, "_") || "data";
  const ext = contentType?.includes("zip") ? "zip" : "csv";
  return `${base}.${ext}`;
};

/**
 * Download a dataset export.
 *
 * Accepts the legacy `source` string (today's behaviour) or
 * `{ source, package }`. The server sends a zip with the data, catalogue and
 * data dictionary by default.
 */
export const downloadData = async (
  request: string | DownloadRequest
): Promise<DownloadResult> => {
  const req: DownloadRequest =
    typeof request === "string" ? { source: request } : request;
  const { source } = req;

  if (USE_EXPORT_MOCKS) {
    const { mockDownload } = await import("../mocks/exportMocks");
    return mockDownload(req);
  }

  const params = new URLSearchParams();
  let endpoint = "/data/download";

  if (source === "economic") {
    endpoint = "/data/download/economic";
  } else if (source === "amu") {
    endpoint = "/data/download/amu";
    params.set("source", "amu");
  } else {
    params.set("source", source);
  }
  if (req.package) params.set("package", req.package);

  const query = params.toString();
  const response = await api.post(
    query ? `${endpoint}?${query}` : endpoint,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "blob",
      onDownloadProgress: (event) => req.onProgress?.(event.loaded),
    }
  );

  const headers = response.headers as Record<string, string | undefined>;
  const contentType = headers["content-type"];
  const filename =
    filenameFromContentDisposition(headers["content-disposition"]) ??
    fallbackFilename(req, contentType);

  return { blob: response.data as Blob, filename };
};

export const useDatasetVariables = (source: string) => {
  return useQuery<any, Error, {data: any}>({
    queryFn: () => api.get(`/data/amr/dictionary?source=${source}`),
    queryKey: ["amr_dictionary", source],
    enabled: !!source && source.trim() !== "", // Only run if source is provided and not empty
    meta: {
      errorMessage: "Failed to fetch dictionary"
    }
  });
}


export const requestAccess = async (data: any) => {
  const response = await api.post("/permissions/request", data);
  return response.data;
};

export const deletePermission = async (permissionId: any) => {
  const response = await api.delete(`/permissions/${permissionId}/delete`);
  return response.data;
};


export const ReRequestAccess = async (permission_id: string) => {
  const response = await api.patch(`/permissions/${permission_id}/re_request`);
  return response.data;
};


