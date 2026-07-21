import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "../types/session.types";

const styles: Record<SessionStatus, string> = {
  PLANNED: "border-blue-400 text-blue-600",
  IN_PROGRESS: "border-yellow-400 text-yellow-600",
  COMPLETED: "border-green-500 text-green-600",
  ABORTED: "border-red-400 text-red-600",
};

const labels: Record<SessionStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  ABORTED: "Aborted",
};

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge variant="outline" className={`text-xs ${styles[status] ?? ""}`}>
      {labels[status] ?? status}
    </Badge>
  );
}
