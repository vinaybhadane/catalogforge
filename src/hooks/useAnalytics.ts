import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { AnalyticsSummary } from "@/types";
import { useAuth } from "@/lib/auth/AuthProvider";
import { computeUserWorkspaceAnalytics } from "@/lib/auth/workspace-guard";

export interface AccuracyDataPoint {
  timestamp: string;
  accuracy: number | null;
  lovResolution: number | null;
}

export interface ManufacturerDistribution {
  manufacturer: string;
  count: number;
  avgConfidence: number;
}

export interface ConfidenceDistribution {
  range: string;
  count: number;
  color: string;
}

export interface StageBreakdown {
  stage: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDetail extends AnalyticsSummary {
  evaluationScope: string | null;
  rowsEvaluated: number | null;
  groundTruthRows: number | null;
  accuracyTimeSeries: AccuracyDataPoint[];
  topManufacturers?: ManufacturerDistribution[];
  confidenceDistribution?: ConfidenceDistribution[];
  stageBreakdown?: StageBreakdown[];
  totalAttributes?: number;
  totalAssets?: number;
  totalJobs?: number;
  autoPublishRate?: number;
  avgLatencySec?: number;
  costPerSku?: number;
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
 * Fetches real-time evaluation and performance metrics.
 * Isolates new standalone users from shared organization analytics unless invited.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const { user, isSharedMember } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsDetail | null>(null);
  const [hookState, setHookState] = useState<AnalyticsHookState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setHookState("loading");
    setErrorMessage(null);

    // If user is a standalone new user (uninvited), compute private analytics
    if (user && !isSharedMember) {
      try {
        const userAnalytics = computeUserWorkspaceAnalytics(user.uid || user.email || "");
        setAnalytics(userAnalytics);
        setLastRefreshedAt(new Date());
        setHookState("success");
      } catch (err) {
        setErrorMessage("Unable to compute workspace analytics.");
        setHookState("error");
      }
      return;
    }

    // For Admin & Invited Team Members, fetch live organization analytics
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
        setAnalytics(null);
        setLastRefreshedAt(new Date());
        setHookState("success");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to load real-time analytics."
        );
        setHookState("error");
      }
    }
  }, [user, isSharedMember]);

  return { analytics, hookState, errorMessage, lastRefreshedAt, refresh };
}
