import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { AnalyticsSummary } from "@/types";

export interface AccuracyDataPoint {
  timestamp: string;
  accuracy: number | null;
  lovResolution: number | null;
}

export interface AnalyticsDetail extends AnalyticsSummary {
  evaluationScope: string | null;
  rowsEvaluated: number | null;
  groundTruthRows: number | null;
  accuracyTimeSeries: AccuracyDataPoint[];
}

export type AnalyticsHookState = "idle" | "loading" | "success" | "error";

export interface UseAnalyticsReturn {
  analytics: AnalyticsDetail | null;
  hookState: AnalyticsHookState;
  errorMessage: string | null;
  lastRefreshedAt: Date | null;
  refresh: () => void;
}

/**
 * Fetches evaluation summary metrics from the analytics API.
 * Section 33: All metric values come from the API — never hardcoded.
 * Section 35: Exposes manual refresh + lastRefreshedAt timestamp.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [analytics, setAnalytics] = useState<AnalyticsDetail | null>(null);
  const [hookState, setHookState] = useState<AnalyticsHookState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setHookState("loading");
    setErrorMessage(null);
    try {
      const data = await apiClient.get<AnalyticsDetail>("/analytics/summary");
      setAnalytics(data);
      setLastRefreshedAt(new Date());
      setHookState("success");
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 ||
          err.code === "NETWORK_ERROR" ||
          err.code === "TIMEOUT")
      ) {
        // Backend not yet connected — explicit empty state, not fake data
        setAnalytics(null);
        setLastRefreshedAt(new Date());
        setHookState("success");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to load analytics data."
        );
        setHookState("error");
      }
    }
  }, []);

  return { analytics, hookState, errorMessage, lastRefreshedAt, refresh };
}
