"use client";

import { useState } from "react";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { useSessionSummary, usePackTrends } from "@/features/reports/hooks/useReports";
import { SessionSummaryCard } from "@/features/reports/components/SessionSummaryCard";
import { PackTrendChart } from "@/features/reports/components/PackTrendChart";

export default function ReportsPage() {
  const { data: sessions } = useSessions();
  const { data: packs } = usePacks();

  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [selectedPackId, setSelectedPackId] = useState("");

  const { data: summary, isLoading: summaryLoading } = useSessionSummary(selectedSessionId);
  const { data: trends, isLoading: trendsLoading } = usePackTrends(selectedPackId);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Session summaries and pack trend analysis
        </p>
      </div>

      {/* Session Summary */}
      <section className="space-y-4">
        <h2 className="font-medium">Session Summary</h2>
        <select
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          value={selectedSessionId}
          onChange={(e) => setSelectedSessionId(e.target.value)}
        >
          <option value="">Select a session...</option>
          {sessions?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.packName} v{s.packVersionNumber}
            </option>
          ))}
        </select>

        {summaryLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
        {summary && <SessionSummaryCard summary={summary} />}
      </section>

      {/* Pack Trend */}
      <section className="space-y-4">
        <h2 className="font-medium">Pack Pass Rate Trend</h2>
        <select
          className="border-input bg-background rounded-md border px-3 py-2 text-sm"
          value={selectedPackId}
          onChange={(e) => setSelectedPackId(e.target.value)}
        >
          <option value="">Select a pack...</option>
          {packs?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {trendsLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
        {trends && trends.length === 0 && (
          <p className="text-muted-foreground text-sm">No session data for this pack yet.</p>
        )}
        {trends && trends.length > 0 && <PackTrendChart trends={trends} />}
      </section>
    </div>
  );
}
