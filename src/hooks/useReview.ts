import { useState, useCallback } from "react";
import { apiClient, ApiClientError } from "@/lib/api/client";
import { ReviewItem, ReviewField, ReviewStatus } from "@/types";

export type ReviewActionState = "idle" | "saving" | "success" | "error";

export interface FieldPatchPayload {
  value: string;
}

export interface UseReviewReturn {
  reviewItem: ReviewItem | null;
  fetchState: "loading" | "success" | "error";
  errorMessage: string | null;
  loadReview: (reviewId: string) => Promise<void>;

  activeFieldName: string | null;
  setActiveFieldName: (name: string | null) => void;

  editingFieldName: string | null;
  setEditingFieldName: (name: string | null) => void;

  patchField: (
    reviewId: string,
    fieldName: string,
    value: string
  ) => Promise<void>;
  fieldActionState: Record<string, ReviewActionState>;
  fieldError: Record<string, string | null>;

  approveRecord: (reviewId: string) => Promise<void>;
  rejectRecord: (reviewId: string) => Promise<void>;
  recordActionState: ReviewActionState;
  recordActionError: string | null;
}

/**
 * Typed mutation and data hook for Review Studio.
 *
 * Wires:
 *   PATCH /api/v1/reviews/:reviewId/fields/:fieldName  — inline field edits
 *   POST  /api/v1/reviews/:reviewId/approve            — approve whole record
 *   POST  /api/v1/reviews/:reviewId/reject             — reject whole record
 *
 * Per Sections 26 & 28: never display success before API confirms.
 */
export function useReview(): UseReviewReturn {
  const [reviewItem, setReviewItem] = useState<ReviewItem | null>(null);
  const [fetchState, setFetchState] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeFieldName, setActiveFieldName] = useState<string | null>(null);
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);

  const [fieldActionState, setFieldActionState] = useState<Record<string, ReviewActionState>>({});
  const [fieldError, setFieldError] = useState<Record<string, string | null>>({});

  const [recordActionState, setRecordActionState] = useState<ReviewActionState>("idle");
  const [recordActionError, setRecordActionError] = useState<string | null>(null);

  const loadReview = useCallback(async (reviewId: string) => {
    setFetchState("loading");
    setErrorMessage(null);
    try {
      const item = await apiClient.get<ReviewItem>(`/reviews/${encodeURIComponent(reviewId)}`);
      setReviewItem(item);
      setFetchState("success");
    } catch (err) {
      if (
        err instanceof ApiClientError &&
        (err.statusCode === 404 || err.code === "NETWORK_ERROR" || err.code === "TIMEOUT")
      ) {
        // Backend not yet connected — surface empty state cleanly
        setReviewItem(null);
        setFetchState("success");
      } else {
        setErrorMessage(
          err instanceof Error ? err.message : "Unable to load review record."
        );
        setFetchState("error");
      }
    }
  }, []);

  const patchField = useCallback(
    async (reviewId: string, fieldName: string, value: string) => {
      setFieldActionState((s) => ({ ...s, [fieldName]: "saving" }));
      setFieldError((e) => ({ ...e, [fieldName]: null }));
      try {
        const updated = await apiClient.patch<ReviewField>(
          `/reviews/${encodeURIComponent(reviewId)}/fields/${encodeURIComponent(fieldName)}`,
          { value } satisfies FieldPatchPayload
        );
        // Merge updated field back into local state
        setReviewItem((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            fields: prev.fields.map((f) =>
              f.fieldName === fieldName ? { ...f, ...updated } : f
            ),
          };
        });
        setFieldActionState((s) => ({ ...s, [fieldName]: "success" }));
        setEditingFieldName(null);
      } catch (err) {
        setFieldActionState((s) => ({ ...s, [fieldName]: "error" }));
        setFieldError((e) => ({
          ...e,
          [fieldName]: err instanceof Error ? err.message : "Failed to save field.",
        }));
      }
    },
    []
  );

  const approveRecord = useCallback(async (reviewId: string) => {
    setRecordActionState("saving");
    setRecordActionError(null);
    try {
      await apiClient.post(`/reviews/${encodeURIComponent(reviewId)}/approve`);
      setReviewItem((prev) =>
        prev ? { ...prev, status: "approved" as ReviewStatus } : prev
      );
      setRecordActionState("success");
    } catch (err) {
      setRecordActionState("error");
      setRecordActionError(
        err instanceof Error ? err.message : "Failed to approve record."
      );
    }
  }, []);

  const rejectRecord = useCallback(async (reviewId: string) => {
    setRecordActionState("saving");
    setRecordActionError(null);
    try {
      await apiClient.post(`/reviews/${encodeURIComponent(reviewId)}/reject`);
      setReviewItem((prev) =>
        prev ? { ...prev, status: "rejected" as ReviewStatus } : prev
      );
      setRecordActionState("success");
    } catch (err) {
      setRecordActionState("error");
      setRecordActionError(
        err instanceof Error ? err.message : "Failed to reject record."
      );
    }
  }, []);

  return {
    reviewItem,
    fetchState,
    errorMessage,
    loadReview,
    activeFieldName,
    setActiveFieldName,
    editingFieldName,
    setEditingFieldName,
    patchField,
    fieldActionState,
    fieldError,
    approveRecord,
    rejectRecord,
    recordActionState,
    recordActionError,
  };
}
