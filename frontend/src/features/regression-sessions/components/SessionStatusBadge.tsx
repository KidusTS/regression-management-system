import { StatusPill } from "@/components/shared/StatusPill";
import { SESSION_META } from "@/lib/status";
import type { SessionStatus } from "../types/session.types";

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return <StatusPill meta={SESSION_META[status]} />;
}
