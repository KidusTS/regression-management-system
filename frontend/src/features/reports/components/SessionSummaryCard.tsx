import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { SessionSummary } from "../types/report.types";

const SLICES = [
  { key: "passed", label: "Passed", color: "#22c55e" },
  { key: "failed", label: "Failed", color: "#ef4444" },
  { key: "blocked", label: "Blocked", color: "#f97316" },
  { key: "skipped", label: "Skipped", color: "#eab308" },
  { key: "notRun", label: "Not Run", color: "#94a3b8" },
] as const;

interface Props {
  summary: SessionSummary;
}

export function SessionSummaryCard({ summary }: Props) {
  const data = SLICES.map((s) => ({ name: s.label, value: summary[s.key], color: s.color })).filter(
    (d) => d.value > 0
  );

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-lg">{summary.sessionName}</h2>
        <p className="text-muted-foreground text-sm">{summary.total} total tests</p>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative h-36 w-36 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={60}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [Number(v), ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold">{summary.passRate.toFixed(1)}%</span>
            <span className="text-muted-foreground text-xs">Pass rate</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {SLICES.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
              <span className="text-sm">{s.label}</span>
              <span className="text-muted-foreground text-sm ml-auto">{summary[s.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
