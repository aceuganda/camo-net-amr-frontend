import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import api from "./../axios";
import type { ExportOptions, ExportProfile } from "@/types/exports";

/**
 * Dev-only: serve the export endpoints from local fixtures
 * (src/lib/mocks/exportMocks.ts). Enable with NEXT_PUBLIC_EXPORT_MOCKS=1 in
 * .env.local. Always off in production builds.
 */
export const USE_EXPORT_MOCKS =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_EXPORT_MOCKS === "1";

/** Poll a pending profile every 10s, for at most 18 polls (~3 minutes). */
export const PROFILE_POLL_MS = 10_000;
export const PROFILE_MAX_POLLS = 18;

export const useExportOptions = (source: string | undefined) => {
  const enabled = !!source && source.trim() !== "";
  return useQuery<ExportOptions, Error>({
    queryKey: ["export_options", source],
    queryFn: async () => {
      if (USE_EXPORT_MOCKS) {
        const { mockOptions } = await import("../mocks/exportMocks");
        return mockOptions(source as string);
      }
      const { data } = await api.get<ExportOptions>(
        `/data/exports/options?source=${encodeURIComponent(source as string)}`
      );
      return data;
    },
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  });
};

/**
 * Ids of datasets with a generated data profile, for catalogue badges. The
 * endpoint is super-admin only while profiles are trialled, so pass `enabled`
 * only for super admins.
 */
export const useProfiledDatasets = (enabled: boolean) => {
  const query = useQuery<{ dataset_ids: string[] }, Error>({
    queryKey: ["profiled_datasets"],
    queryFn: async () => {
      const { data } = await api.get<{ dataset_ids: string[] }>("/data/exports/profiled");
      return data;
    },
    enabled,
    staleTime: 5 * 60_000,
    retry: false,
  });
  return new Set(query.data?.dataset_ids ?? []);
};

/** The dataset's column profile, per flat (economic: per cost section). */
export const useColumnProfile = (
  source: string | undefined,
  options: { enabled?: boolean } = {}
) => {
  const queryClient = useQueryClient();
  const enabled = (options.enabled ?? true) && !!source && source.trim() !== "";

  const query = useQuery<ExportProfile, Error>({
    queryKey: ["export_profile", source],
    queryFn: async () => {
      if (USE_EXPORT_MOCKS) {
        const { mockProfile } = await import("../mocks/exportMocks");
        return mockProfile(source as string);
      }
      const params = new URLSearchParams({ source: source as string });
      const { data } = await api.get<ExportProfile>(
        `/data/exports/profile?${params.toString()}`
      );
      return data;
    },
    enabled,
    staleTime: 10 * 60_000,
    retry: 1,
    refetchInterval: (q) =>
      q.state.data?.status === "pending" &&
      q.state.dataUpdateCount <= PROFILE_MAX_POLLS
        ? PROFILE_POLL_MS
        : false,
  });

  // True once a still-pending profile has used up its automatic polls; the UI
  // then offers a manual "Check again" instead of polling forever.
  const updates =
    queryClient.getQueryState(["export_profile", source])
      ?.dataUpdateCount ?? 0;
  const pollingStopped =
    query.data?.status === "pending" && updates > PROFILE_MAX_POLLS;

  return { ...query, pollingStopped };
};

/**
 * Best-effort message from an axios error. For `responseType: "blob"`
 * requests the error body is a Blob, so read it as text and parse `detail`.
 */
export const getErrorDetail = async (
  error: unknown,
  fallback: string
): Promise<string> => {
  if (!isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
  const body: unknown = error.response?.data;
  try {
    const text =
      body instanceof Blob
        ? await body.text()
        : typeof body === "string"
          ? body
          : null;
    const parsed: unknown = text ? JSON.parse(text) : body;
    if (parsed && typeof parsed === "object" && "detail" in parsed) {
      const detail = (parsed as { detail: unknown }).detail;
      if (typeof detail === "string" && detail.trim()) return detail;
      if (Array.isArray(detail) && detail.length) {
        return detail
          .map((d) =>
            d && typeof d === "object" && "msg" in d ? String(d.msg) : String(d)
          )
          .join("; ");
      }
    }
  } catch {
    // Body was not JSON; use the fallback.
  }
  return fallback;
};
