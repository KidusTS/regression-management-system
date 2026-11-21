"use client";

import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { RESULT_META, RESULT_ORDER } from "@/lib/status";
import { cn } from "@/lib/utils";
import type { SessionSummary } from "../types/report.types";

const KEY = { PASS: "passed", FAIL: "failed", BLOCKED: "blocked", SKIPPED: "skipped", NOT_RUN: "notRun" } as const;
// Chart fills mirror the status tokens (CSS variables work in SVG fill).
const FILL = {
  PASS: "var(--success)", FAIL: "var(--danger)", BLOCKED: "oklch(0.7 0.18 50)", SKIPPED: "var(--info)", NOT_RUN: "var(--border)",
} as const;

export function SessionSummaryCard({ summary }: { summary: SessionSummary }) {
  const data = RESULT_ORDER.map((r) => ({ name: RESULT_META[r].label, value: summary[KEY[r]], fill: FILL[r] })).filter((d) => d.value > 0);

  return (
    <div className="bg-card space-y-5 rounded-xl border p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">{summary.sessionName}</h3>
          <p className="text-muted-foreground text-sm">{summary.total} tests</p>
        </div>
        <Link href={`/regression-sessions/${summary.sessionId}`} className="text-primary text-sm font-medium hover:underline">Open session</Link>
      </div>

      <div className="flex flex-col items-center gap-8 sm:flex-row">
        <div className="relative size-44 shrink-0" role="img" aria-label={`Pass rate ${summary.passRate.toFixed(1)} percent`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={58} outerRadius={80} dataKey="value" strokeWidth={2} stroke="var(--card)">
                {data.map((d) => <Cell key={d.name} fill={d.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--popover)", border: "1px solid var(--border)", color: "var(--popover-foreground)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold tabular-nums">{summary.passRate.toFixed(1)}%</span>
            <span className="text-muted-foreground text-xs">pass rate</span>
          </div>
        </div>

        <div className="grid w-full flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          {RESULT_ORDER.map((r) => {
            const meta = RESULT_META[r];
            const Icon = meta.icon;
            return (
              <div key={r} className="flex items-center gap-3 rounded-lg border p-3">
                <span className={cn("flex size-8 items-center justify-center rounded-md", meta.tone)}><Icon className="size-4" aria-hidden /></span>
                <div>
                  <p className="text-lg leading-none font-semibold tabular-nums">{summary[KEY[r]]}</p>
                  <p className="text-muted-foreground text-xs">{meta.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
