"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCheck, ListX, Play, XCircle } from "lucide-react";
import { useSessionDetail, useSessionResults } from "@/features/regression-sessions/hooks/useSession.queries";
import { useUpdateSessionStatus, useBulkUpdateResults } from "@/features/regression-sessions/hooks/useSession.mutations";
import { SessionStatusBadge } from "@/features/regression-sessions/components/SessionStatusBadge";
import { ExecutionResultsTable } from "@/features/regression-sessions/components/ExecutionResultsTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StackedProgress } from "@/components/shared/StackedProgress";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { Skeleton, TableSkeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { RESULT_META, RESULT_ORDER } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { ResultValue, SessionStatus } from "@/features/regression-sessions/types/session.types";

const TRANSITIONS: Record<SessionStatus, { label: string; next: SessionStatus; destructive?: boolean; confirm?: string }[]> = {
  PLANNED: [{ label: "Start session", next: "IN_PROGRESS" }],
  IN_PROGRESS: [
    { label: "Abort", next: "ABORTED", destructive: true, confirm: "Aborting marks this session as stopped. Recorded results are kept." },
    { label: "Complete", next: "COMPLETED", confirm: "Mark this session as completed?" },
  ],
  COMPLETED: [],
  ABORTED: [],
};

const COUNT_KEY = { PASS: "passed", FAIL: "failed", BLOCKED: "blocked", SKIPPED: "skipped", NOT_RUN: "notRun" } as const;

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isLoading } = useSessionDetail(id);
  const { data: results, isLoading: resultsLoading } = useSessionResults(id);
  const { mutate: updateStatus, isPending: statusPending } = useUpdateSessionStatus(id);
  const { mutate: bulkUpdate, isPending: bulkPending } = useBulkUpdateResults(id);

  const [filter, setFilter] = useState<ResultValue | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [bulk, setBulk] = useState<"PASS" | "FAIL" | null>(null);
  const [transition, setTransition] = useState<(typeof TRANSITIONS)[SessionStatus][number] | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (results ?? []).filter(
      (r) =>
        (filter === "ALL" || r.result === filter) &&
        (!q || [r.testIdRef, r.testTitle, r.module, r.feature].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [results, filter, query]);

  if (isLoading) return <div className="space-y-4"><Skeleton className="h-9 w-72" /><Skeleton className="h-3 w-full" /><TableSkeleton /></div>;
  if (!session) return <EmptyState icon={XCircle} title="Session not found" description="It may have been removed." />;

  const executed = session.totalTests - session.notRun;
  const pct = session.totalTests > 0 ? Math.round((executed / session.totalTests) * 100) : 0;
  const transitions = TRANSITIONS[session.status] ?? [];

  return (
    <>
      <PageHeader
        back={{ href: "/regression-sessions", label: "All sessions" }}
        title={session.name}
        description={session.description ?? undefined}
        meta={
          <>
            <SessionStatusBadge status={session.status} />
            <span>{session.packName} v{session.packVersionNumber}</span>
            {session.softwareVersion && <span>Build {session.softwareVersion}</span>}
            {session.environment && <span>{session.environment}</span>}
          </>
        }
        actions={transitions.map((t) => (
          <Button
            key={t.next}
            variant={t.destructive ? "destructive" : t.next === "COMPLETED" ? "outline" : "default"}
            disabled={statusPending}
            onClick={() => (t.confirm ? setTransition(t) : updateStatus(t.next, { onSuccess: () => toast.success("Session started") }))}
          >
            {t.next === "IN_PROGRESS" && <Play aria-hidden />}
            {t.label}
          </Button>
        ))}
      />

      {/* Progress */}
      <section className="bg-card space-y-4 rounded-xl border p-5 shadow-sm" aria-label="Progress">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium">{executed} of {session.totalTests} tests executed</p>
          <p className="text-2xl font-semibold tabular-nums">{pct}%</p>
        </div>
        <StackedProgress counts={session} height="h-3" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {RESULT_ORDER.map((r) => {
            const meta = RESULT_META[r];
            const Icon = meta.icon;
            const active = filter === r;
            return (
              <button
                key={r}
                onClick={() => setFilter(active ? "ALL" : r)}
                aria-pressed={active}
                title={active ? "Clear filter" : `Show only ${meta.label.toLowerCase()}`}
                className={cn("flex items-center gap-3 rounded-lg border p-3 text-left transition-colors", active ? "border-primary bg-accent" : "hover:bg-muted")}
              >
                <span className={cn("flex size-8 items-center justify-center rounded-md", meta.tone)}><Icon className="size-4" aria-hidden /></span>
                <span>
                  <span className="block text-lg leading-none font-semibold tabular-nums">{session[COUNT_KEY[r]]}</span>
                  <span className="text-muted-foreground text-xs">{meta.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-lg font-semibold">
            Test cases{" "}
            <span className="text-muted-foreground text-sm font-normal">
              {visible.length === (results?.length ?? 0) ? `${visible.length}` : `${visible.length} of ${results?.length ?? 0}`}
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput value={query} onChange={setQuery} placeholder="Search tests…" className="w-full sm:w-60" />
            <Button variant="outline" size="sm" disabled={bulkPending || !results?.length} onClick={() => setBulk("PASS")}>
              <CheckCheck aria-hidden /> Pass all
            </Button>
            <Button variant="outline" size="sm" disabled={bulkPending || !results?.length} onClick={() => setBulk("FAIL")}>
              <XCircle aria-hidden /> Fail all
            </Button>
          </div>
        </div>

        {resultsLoading && <TableSkeleton />}
        {results && visible.length === 0 && (
          <EmptyState
            icon={ListX}
            title="No test cases to show"
            description="Nothing matches your current filter."
            action={<Button variant="outline" onClick={() => { setFilter("ALL"); setQuery(""); }}>Clear filters</Button>}
          />
        )}
        {visible.length > 0 && <ExecutionResultsTable sessionId={id} results={visible} />}
      </section>

      <ConfirmDialog
        open={!!bulk}
        onCancel={() => setBulk(null)}
        destructive={bulk === "FAIL"}
        title={`Mark all ${results?.length ?? 0} tests as ${bulk === "PASS" ? "passed" : "failed"}?`}
        description="This overwrites the current result of every test in this session."
        confirmLabel={bulk === "PASS" ? "Pass all" : "Fail all"}
        pending={bulkPending}
        onConfirm={() => {
          if (!results || !bulk) return;
          bulkUpdate(
            { results: results.map((r) => ({ resultId: r.id, result: bulk, comment: r.comment ?? undefined })) },
            { onSuccess: () => { toast.success(`All tests marked ${bulk === "PASS" ? "passed" : "failed"}`); setBulk(null); }, onError: () => toast.error("Bulk update failed") }
          );
        }}
      />

      <ConfirmDialog
        open={!!transition}
        onCancel={() => setTransition(null)}
        destructive={transition?.destructive}
        title={transition?.label ?? ""}
        description={transition?.confirm}
        confirmLabel={transition?.label}
        pending={statusPending}
        onConfirm={() => transition && updateStatus(transition.next, { onSuccess: () => { toast.success(`Session ${transition.next === "COMPLETED" ? "completed" : "aborted"}`); setTransition(null); } })}
      />
    </>
  );
}
