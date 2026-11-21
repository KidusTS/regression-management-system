import { CheckCircle2, CircleDashed, Ban, SkipForward, XCircle, Clock, PlayCircle, CircleSlash, type LucideIcon } from "lucide-react";
import type { ResultValue, SessionStatus } from "@/features/regression-sessions/types/session.types";

export interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** soft background + text colour classes */
  tone: string;
  /** solid colour for bars / dots */
  solid: string;
}

export const RESULT_META: Record<ResultValue, StatusMeta> = {
  PASS: { label: "Passed", icon: CheckCircle2, tone: "bg-success-soft text-success", solid: "bg-success" },
  FAIL: { label: "Failed", icon: XCircle, tone: "bg-danger-soft text-danger", solid: "bg-danger" },
  BLOCKED: { label: "Blocked", icon: Ban, tone: "bg-warning-soft text-warning", solid: "bg-orange-500" },
  SKIPPED: { label: "Skipped", icon: SkipForward, tone: "bg-info-soft text-info", solid: "bg-info" },
  NOT_RUN: { label: "Not run", icon: CircleDashed, tone: "bg-neutral-soft text-neutral", solid: "bg-neutral/40" },
};

export const RESULT_ORDER: ResultValue[] = ["PASS", "FAIL", "BLOCKED", "SKIPPED", "NOT_RUN"];

export const SESSION_META: Record<SessionStatus, StatusMeta> = {
  PLANNED: { label: "Planned", icon: Clock, tone: "bg-info-soft text-info", solid: "bg-info" },
  IN_PROGRESS: { label: "In progress", icon: PlayCircle, tone: "bg-warning-soft text-warning", solid: "bg-warning" },
  COMPLETED: { label: "Completed", icon: CheckCircle2, tone: "bg-success-soft text-success", solid: "bg-success" },
  ABORTED: { label: "Aborted", icon: CircleSlash, tone: "bg-danger-soft text-danger", solid: "bg-danger" },
};
