"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendReport } from "../types/report.types";

export function PackTrendChart({ trends }: { trends: TrendReport[] }) {
  const data = trends.map((t) => ({
    name: t.softwareVersion ?? t.sessionName,
    session: t.sessionName,
    passRate: parseFloat(t.passRate.toFixed(1)),
    passed: t.passed,
    total: t.total,
  }));

  return (
    <div className="bg-card space-y-4 rounded-xl border p-6 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold">Pass rate across sessions</h3>
        <p className="text-muted-foreground text-sm">{data.length} {data.length === 1 ? "session" : "sessions"}, oldest to newest</p>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} stroke="var(--border)" />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, background: "var(--popover)", border: "1px solid var(--border)", color: "var(--popover-foreground)" }}
            formatter={(v, _n, item) => [`${Number(v)}% (${item.payload.passed}/${item.payload.total})`, "Pass rate"]}
            labelFormatter={(_l, p) => p?.[0]?.payload?.session ?? ""}
          />
          <Line type="monotone" dataKey="passRate" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
