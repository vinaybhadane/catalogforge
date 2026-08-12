import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ProcessingJob } from "@/types";

export interface DashboardSummary {
  productsProcessed: number | null;
  activeJobs: number | null;
  needsReview: number | null;
  published: number | null;
  averageConfidence: number | null;
  recentJobs: ProcessingJob[];
}

export type DashboardHookState = "idle" | "loading" | "success" | "error";

export interface UseDashboardReturn {
  summary: DashboardSummary | null;
  hookState: DashboardHookState;
  errorMessage: string | null;
  refresh: () => void;
}

/**
 * Section 14: Fetches dashboard summary from API.
 * All KPI values are API-driven — never hardcoded.
 */
export function useDashboard(): UseDashboardReturn {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hookState, setHookState] = useState<DashboardHookState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setHookState("loading");
    setErrorMessage(null);
    try {
      const data = await apiClient.get<DashboardSummary>("/dashboard/summary");
      setSummary(data);
      setHookState("success");
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")
      ) {
        setSummary(null);
        setHookState("success");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to load dashboard data."
        );
        setHookState("error");
      }
    }
  }, []);

  return { summary, hookState, errorMessage, refresh };
}
