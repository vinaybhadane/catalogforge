import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { PaginatedResponse } from "@/types";

export type AuditAction =
  | "auto_publish"
  | "approved"
  | "corrected"
  | "rejected"
  | string;

export interface AuditEvent {
  auditId: string;
  timestamp: string;
  productId: string;
  fieldName: string;
  generatedValue: string | null;
  confidence: number | null;
  validationFlags: string[];
  reviewer: string | null;
  action: AuditAction;
  /** Expandable detail — may be null if backend omits */
  sourceSnippet: string | null;
  previousValue: string | null;
  finalValue: string | null;
}

export type AuditHookState = "idle" | "loading" | "success" | "error";

export interface UseAuditLogsReturn {
  events: AuditEvent[];
  hookState: AuditHookState;
  errorMessage: string | null;
  page: number;
  totalPages: number | null;
  total: number | null;
  setPage: (page: number) => void;
  refresh: () => void;
}

/**
 * Fetches paginated audit log events from the API.
 * Section 36: Server-side pagination — frontend never assumes all events fit one page.
 */
export function useAuditLogs(pageSize = 25): UseAuditLogsReturn {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [hookState, setHookState] = useState<AuditHookState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadPage = useCallback(
    async (p: number) => {
      setHookState("loading");
      setErrorMessage(null);
      try {
        const res = await apiClient.get<PaginatedResponse<AuditEvent>>(
          "/audit/events",
          { params: { page: p, pageSize } }
        );
        setEvents(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        setHookState("success");
      } catch (err) {
        if (
          err instanceof ApiClientError &&
          (err.statusCode === 404 ||
            err.code === "NETWORK_ERROR" ||
            err.code === "TIMEOUT")
        ) {
          setEvents([]);
          setTotalPages(null);
          setTotal(null);
          setHookState("success");
        } else {
          setErrorMessage(
            err instanceof Error ? err.message : "Unable to load audit logs."
          );
          setHookState("error");
        }
      }
    },
    [pageSize]
  );

  const setPage = useCallback(
    (p: number) => {
      setPageState(p);
      loadPage(p);
    },
    [loadPage]
  );

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    loadPage(page);
  }, [loadPage, page]);

  // Load on mount via idle->loading trigger
  useState(() => {
    loadPage(1);
  });

  return {
    events,
    hookState,
    errorMessage,
    page,
    totalPages,
    total,
    setPage,
    refresh,
  };
}
