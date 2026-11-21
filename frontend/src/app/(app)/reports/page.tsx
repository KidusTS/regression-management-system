"use client";

import { useState } from "react";
import { BarChart3, LineChart } from "lucide-react";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { useSessionSummary, usePackTrends } from "@/features/reports/hooks/useReports";
import { SessionSummaryCard } from "@/features/reports/components/SessionSummaryCard";
import { PackTrendChart } from "@/features/reports/components/PackTrendChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/shared/Skeleton";
import { Field, selectClass } from "@/components/shared/Field";

export default function ReportsPage() {
  const { data: sessions } = useSessions();
  const { data: packs } = usePacks();
  const [sessionId, setSessionId] = useState("");
  const [packId, setPackId] = useState("");

  const { data: summary, isLoading: summaryLoading } = useSessionSummary(sessionId);
  const { data: trends, isLoading: trendsLoading } = usePackTrends(packId);

  return (
    <>
      <PageHeader title="Reports" description="Dig into a single session, or see how a pack's pass rate changes over time." />

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold">Session summary</h2>
          <div className="sm:w-80">
            <Field label="Session">
              {(id) => (
                <select id={id} className={selectClass} value={sessionId} onChange={(e) => setSessionId(e.target.value)}>
                  <option value="">Choose a session…</option>
                  {sessions?.map((s) => <option key={s.id} value={s.id}>{s.name} — {s.packName} v{s.packVersionNumber}</option>)}
                </select>
              )}
            </Field>
          </div>
        </div>
        {!sessionId && <EmptyState icon={BarChart3} title="Pick a session" description="You'll see its result breakdown and pass rate here." />}
        {sessionId && summaryLoading && <Skeleton className="h-52 w-full rounded-xl" />}
        {summary && <SessionSummaryCard summary={summary} />}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-lg font-semibold">Pass-rate trend</h2>
          <div className="sm:w-80">
            <Field label="Pack">
              {(id) => (
                <select id={id} className={selectClass} value={packId} onChange={(e) => setPackId(e.target.value)}>
                  <option value="">Choose a pack…</option>
                  {packs?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </Field>
          </div>
        </div>
        {!packId && <EmptyState icon={LineChart} title="Pick a pack" description="Compare pass rates across all sessions run against it." />}
        {packId && trendsLoading && <Skeleton className="h-72 w-full rounded-xl" />}
        {trends && trends.length === 0 && <EmptyState icon={LineChart} title="No sessions for this pack yet" description="Run a session to start building a trend." />}
        {trends && trends.length > 0 && <PackTrendChart trends={trends} />}
      </section>
    </>
  );
}
