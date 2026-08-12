"use client";

import React from "react";
import {
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  XCircle,
  ArrowDown,
} from "lucide-react";
import { ProcessingStage } from "@/types";
import { cn } from "@/lib/utils";

export type StageState = "complete" | "in_progress" | "pending" | "needs_attention" | "failed";

export interface PipelineStageDefinition {
  id: ProcessingStage | string;
  label: string;
  description: string;
}

/** Canonical pipeline order, Section 19.2 */
export const PIPELINE_STAGES: PipelineStageDefinition[] = [
  { id: "ingested",    label: "Ingested",    description: "Raw rows accepted by the ingestion service" },
  { id: "classified",  label: "Classified",  description: "Taxonomy classpath resolved per product row" },
  { id: "enriched",    label: "Enriched",    description: "Attributes and descriptions generated" },
  { id: "validated",   label: "Validated",   description: "Field-level confidence scoring & flag evaluation" },
  { id: "needs_review",label: "Review Queue","description": "Low-confidence rows routed for human approval" },
  { id: "published",   label: "Published",   description: "Records accepted and available in catalog" },
];

/** Maps a current ProcessingStage to a state for each stage in the pipeline */
export function resolveStageState(
  stageDef: PipelineStageDefinition,
  currentStage: ProcessingStage | string | null,
  jobStatus: string
): StageState {
  const order = PIPELINE_STAGES.map((s) => s.id);
  const currentIdx = currentStage ? order.indexOf(currentStage) : -1;
  const stageIdx = order.indexOf(stageDef.id);

  if (jobStatus === "failed" && currentStage === stageDef.id) return "failed";
  if (stageDef.id === "needs_review" && currentStage === "needs_review") return "needs_attention";
  if (currentIdx === -1) return "pending";
  if (stageIdx < currentIdx) return "complete";
  if (stageIdx === currentIdx) {
    if (jobStatus === "failed") return "failed";
    return "in_progress";
  }
  return "pending";
}

interface StageNodeProps {
  stage: PipelineStageDefinition;
  state: StageState;
  isLast: boolean;
}

function StageNode({ stage, state, isLast }: StageNodeProps) {
  const icon = (() => {
    switch (state) {
      case "complete":
        return (
          <CheckCircle2 className="w-5 h-5 text-[#047857]" aria-hidden="true" />
        );
      case "in_progress":
        return (
          <Loader2 className="w-5 h-5 text-[#1D4ED8] animate-spin" aria-hidden="true" />
        );
      case "needs_attention":
        return (
          <AlertTriangle className="w-5 h-5 text-[#B45309]" aria-hidden="true" />
        );
      case "failed":
        return (
          <XCircle className="w-5 h-5 text-[#B91C1C]" aria-hidden="true" />
        );
      default:
        return (
          <Circle className="w-5 h-5 text-slate-300" aria-hidden="true" />
        );
    }
  })();

  const labelColor = (() => {
    switch (state) {
      case "complete":       return "text-[#047857] font-semibold";
      case "in_progress":    return "text-[#1D4ED8] font-bold";
      case "needs_attention":return "text-[#B45309] font-semibold";
      case "failed":         return "text-[#B91C1C] font-semibold";
      default:               return "text-slate-400";
    }
  })();

  const bgColor = (() => {
    switch (state) {
      case "complete":       return "bg-[#ECFDF5] border-[#047857]";
      case "in_progress":    return "bg-[#EFF6FF] border-[#1D4ED8]";
      case "needs_attention":return "bg-[#FFFBEB] border-[#B45309]";
      case "failed":         return "bg-[#FEF2F2] border-[#B91C1C]";
      default:               return "bg-slate-50 border-slate-200";
    }
  })();

  const stateSymbol = (() => {
    switch (state) {
      case "complete":       return "●";
      case "in_progress":    return "◉";
      case "needs_attention":return "!";
      case "failed":         return "×";
      default:               return "○";
    }
  })();

  const stateLabel = (() => {
    switch (state) {
      case "complete":       return "Complete";
      case "in_progress":    return "In Progress";
      case "needs_attention":return "Needs Attention";
      case "failed":         return "Failed";
      default:               return "Pending";
    }
  })();

  return (
    <li className="flex flex-col items-center">
      {/* Stage Card */}
      <div
        className={cn(
          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
          bgColor
        )}
        role="listitem"
        aria-label={`Pipeline stage: ${stage.label} — ${stateLabel}`}
      >
        <div className="shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className={cn("text-sm leading-tight", labelColor)}>
            <span className="mr-1.5 font-mono text-xs opacity-70">{stateSymbol}</span>
            {stage.label}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 truncate">
            {stage.description}
          </div>
        </div>
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shrink-0",
            state === "complete"       && "bg-emerald-100 text-emerald-700",
            state === "in_progress"    && "bg-blue-100 text-blue-700",
            state === "needs_attention"&& "bg-amber-100 text-amber-700",
            state === "failed"         && "bg-red-100 text-red-700",
            state === "pending"        && "bg-slate-100 text-slate-500"
          )}
        >
          {stateLabel}
        </span>
      </div>

      {/* Connector arrow between stages */}
      {!isLast && (
        <div className="flex items-center justify-center h-6 text-slate-300" aria-hidden="true">
          <ArrowDown className="w-4 h-4" />
        </div>
      )}
    </li>
  );
}

interface PipelineStageStepperProps {
  currentStage: ProcessingStage | string | null;
  jobStatus: string;
  className?: string;
}

/**
 * Accessible pipeline stage stepper — Section 20.
 * Renders one node per stage with explicit visual state indicators.
 * Does NOT use animation alone to communicate state.
 */
export function PipelineStageStepper({
  currentStage,
  jobStatus,
  className,
}: PipelineStageStepperProps) {
  return (
    <section aria-label="Pipeline stage progress" className={cn("w-full", className)}>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        Pipeline Progress
      </h3>
      <ol className="space-y-0 list-none p-0 m-0">
        {PIPELINE_STAGES.map((stage, idx) => (
          <StageNode
            key={stage.id}
            stage={stage}
            state={resolveStageState(stage, currentStage, jobStatus)}
            isLast={idx === PIPELINE_STAGES.length - 1}
          />
        ))}
      </ol>
    </section>
  );
}
