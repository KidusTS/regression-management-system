"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TrendReport } from "../types/report.types";

interface Props {
  trends: TrendReport[];
}

export function PackTrendChart({ trends }: Props) {
  const data = trends.map((t) => ({
    name: t.softwareVersion ?? t.sessionName,
    passRate: parseFloat(t.passRate.toFixed(1)),
    passed: t.passed,
    total: t.total,
  }));

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-lg">Pass Rate Trend</h2>
        <p className="text-muted-foreground text-sm">Pass rate across sessions for this pack</p>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12 }}
            className="text-muted-foreground"
          />
          <Tooltip
            formatter={(v: number) => [`${v}%`, "Pass rate"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="passRate"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 4, fill: "#22c55e" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
