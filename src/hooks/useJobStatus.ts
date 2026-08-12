import { useEffect, useState, useCallback, useRef } from "react";
import {
  JobStatus,
  JobStatusSource,
  defaultJobStatusSource,
} from "@/lib/api/jobStatusSource";

export type JobStatusHookState =
  | "loading"
  | "live"
  | "error"
  | "not_found";

interface UseJobStatusReturn {
  jobStatus: JobStatus | null;
  hookState: JobStatusHookState;
  errorMessage: string | null;
  refresh: () => void;
}

/**
 * Manages real-time status updates for a specific jobId.
 * Section 20: Subscribe via the transport abstraction, never directly polling in UI.
 */
export function useJobStatus(
  jobId: string | null,
  source: JobStatusSource = defaultJobStatusSource
): UseJobStatusReturn {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [hookState, setHookState] = useState<JobStatusHookState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setHookState("loading");
    setErrorMessage(null);
  }, []);

  useEffect(() => {
    if (!jobId) {
      setHookState("not_found");
      return;
    }

    // Cleanup any previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    setHookState("loading");
    setErrorMessage(null);

    const unsubscribe = source.subscribe(
      jobId,
      (status) => {
        setJobStatus(status);
        setHookState("live");
        setErrorMessage(null);
      },
      (err) => {
        setErrorMessage(err.message);
        setHookState("error");
      }
    );

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [jobId, source, refreshKey]);

  return { jobStatus, hookState, errorMessage, refresh };
}
