import { ProcessingJob, ProcessingStage } from "@/types";
import { apiClient, ApiClientError } from "@/lib/api/client";

/**
 * Canonical job status shape returned from the real-time subscription layer.
 * UI components consume this shape regardless of the underlying transport.
 */
export interface JobStatus {
  jobId: string;
  fileName: string | null;
  rowCount: number | null;
  status: string;
  stage: ProcessingStage | null;
  progress: number | null;
  submittedAt: string;
  completedAt: string | null;
  /** Row-level counts by status. All values may be null until backend populates. */
  rowStats: {
    total: number | null;
    ingested: number | null;
    classified: number | null;
    enriched: number | null;
    validated: number | null;
    published: number | null;
    needsReview: number | null;
    failed: number | null;
  };
}

/**
 * Transport-agnostic interface defined in Section 20.
 * subscribe() returns a cleanup/unsubscribe function.
 * The UI never knows whether data arrives via polling, WebSocket, or SSE.
 */
export interface JobStatusSource {
  subscribe(
    jobId: string,
    onUpdate: (status: JobStatus) => void,
    onError?: (err: Error) => void
  ): () => void;
}

/**
 * Converts a raw ProcessingJob API response to the canonical JobStatus shape.
 */
export function mapJobToStatus(job: ProcessingJob): JobStatus {
  return {
    jobId: job.jobId,
    fileName: job.fileName,
    rowCount: job.rowCount,
    status: job.status,
    stage: job.stage,
    progress: job.progress,
    submittedAt: job.submittedAt,
    completedAt: job.completedAt,
    rowStats: {
      total: job.rowCount,
      ingested: null,
      classified: null,
      enriched: null,
      validated: null,
      published: null,
      needsReview: null,
      failed: null,
    },
  };
}

/** Terminal stages: once reached, polling can be slowed or stopped. */
const TERMINAL_STAGES = new Set<string>([
  "published",
  "failed",
]);

/**
 * Polling-based implementation of JobStatusSource (Section 20).
 * Replace or augment with a WebSocket/SignalR implementation later
 * without changing any UI component.
 */
export class PollingJobStatusSource implements JobStatusSource {
  private readonly intervalMs: number;

  constructor(intervalMs = 4000) {
    this.intervalMs = intervalMs;
  }

  subscribe(
    jobId: string,
    onUpdate: (status: JobStatus) => void,
    onError?: (err: Error) => void
  ): () => void {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      if (cancelled) return;

      try {
        const job = await apiClient.get<ProcessingJob>(
          `/ingestion/jobs/${encodeURIComponent(jobId)}`
        );

        if (!cancelled) {
          const status = mapJobToStatus(job);
          onUpdate(status);

          // Slow poll cadence once terminal; continue for UI refresh consistency
          const isTerminal = status.stage !== null && TERMINAL_STAGES.has(status.stage);
          const nextInterval = isTerminal ? this.intervalMs * 5 : this.intervalMs;
          if (!cancelled) {
            timerId = setTimeout(poll, nextInterval);
          }
        }
      } catch (err) {
        if (!cancelled) {
          const error =
            err instanceof Error
              ? err
              : new Error("Unknown error polling job status");
          onError?.(error);
          // Retry even on transient error (backend may not yet be connected)
          timerId = setTimeout(poll, this.intervalMs * 2);
        }
      }
    };

    // Initial fetch immediately
    poll();

    return () => {
      cancelled = true;
      if (timerId !== null) {
        clearTimeout(timerId);
      }
    };
  }
}

/**
 * Default singleton source — swap to WebSocketJobStatusSource when the backend supports it.
 */
export const defaultJobStatusSource: JobStatusSource = new PollingJobStatusSource(4000);
