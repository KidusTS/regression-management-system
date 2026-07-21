"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useSessionDetail,
  useSessionResults,
} from "@/features/regression-sessions/hooks/useSession.queries";
import { useUpdateSessionStatus, useBulkUpdateResults } from "@/features/regression-sessions/hooks/useSession.mutations";
import { SessionStatusBadge } from "@/features/regression-sessions/components/SessionStatusBadge";
import { ExecutionResultsTable } from "@/features/regression-sessions/components/ExecutionResultsTable";
import { Button } from "@/components/ui/button";
import type { SessionStatus } from "@/features/regression-sessions/types/session.types";

const STATUS_TRANSITIONS: Record<SessionStatus, { label: string; next: string }[]> = {
  PLANNED: [{ label: "Start", next: "IN_PROGRESS" }],
  IN_PROGRESS: [
    { label: "Complete", next: "COMPLETED" },
    { label: "Abort", next: "ABORTED" },
  ],
  COMPLETED: [],
  ABORTED: [],
};

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useSessionDetail(id);
  const { data: results, isLoading: resultsLoading } = useSessionResults(id);
  const { mutate: updateStatus, isPending: statusPending } = useUpdateSessionStatus(id);
  const { mutate: bulkUpdate, isPending: bulkPending } = useBulkUpdateResults(id);

  const markAll = (result: "PASS" | "FAIL") => {
    if (!results) return;
    bulkUpdate({ results: results.map((r) => ({ resultId: r.id, result })) });
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;
  if (!session) return <p className="text-destructive text-sm">Session not found.</p>;

  const transitions = STATUS_TRANSITIONS[session.status] ?? [];
  const progressPct = session.totalTests > 0
    ? Math.round(((session.totalTests - session.notRun) / session.totalTests) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <Link href="/regression-sessions" className="text-muted-foreground hover:text-foreground text-sm">← Back to sessions</Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{session.name}</h1>
          <div className="flex items-center gap-3">
            <SessionStatusBadge status={session.status} />
            <span className="text-muted-foreground text-sm">
              {session.packName} v{session.packVersionNumber}
            </span>
            {session.softwareVersion && (
              <span className="text-muted-foreground text-sm">{session.softwareVersion}</span>
            )}
            {session.environment && (
              <span className="text-muted-foreground text-sm">{session.environment}</span>
            )}
          </div>
          {session.description && (
            <p className="text-muted-foreground text-sm">{session.description}</p>
          )}
        </div>

        {transitions.length > 0 && (
          <div className="flex gap-2">
            {transitions.map((t) => (
              <Button
                key={t.next}
                variant={t.next === "ABORTED" ? "destructive" : "default"}
                size="sm"
                disabled={statusPending}
                onClick={() => updateStatus(t.next)}
              >
                {t.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{progressPct}%</span>
        </div>
        <div className="bg-muted h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Tallies */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Passed", value: session.passed, color: "text-green-600" },
          { label: "Failed", value: session.failed, color: "text-destructive" },
          { label: "Blocked", value: session.blocked, color: "text-orange-600" },
          { label: "Skipped", value: session.skipped, color: "text-yellow-600" },
          { label: "Not Run", value: session.notRun, color: "text-muted-foreground" },
        ].map((item) => (
          <div key={item.label} className="bg-muted/50 rounded-lg border p-4 text-center">
            <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
            <p className="text-muted-foreground text-xs">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Results table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">
            Execution Results
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              {session.totalTests} tests
            </span>
          </h2>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-green-500 h-4 w-4 cursor-pointer"
                checked={results?.every((r) => r.result === "PASS") ?? false}
                disabled={bulkPending || !results?.length}
                onChange={(e) => e.target.checked && markAll("PASS")}
              />
              <span className="text-sm text-green-600">All Pass</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-red-500 h-4 w-4 cursor-pointer"
                checked={results?.every((r) => r.result === "FAIL") ?? false}
                disabled={bulkPending || !results?.length}
                onChange={(e) => e.target.checked && markAll("FAIL")}
              />
              <span className="text-sm text-destructive">All Fail</span>
            </label>
          </div>
        </div>
        {resultsLoading && <p className="text-muted-foreground text-sm">Loading results...</p>}
        {results && results.length > 0 && (
          <ExecutionResultsTable sessionId={id} results={results} />
        )}
      </div>
    </div>
  );
}
