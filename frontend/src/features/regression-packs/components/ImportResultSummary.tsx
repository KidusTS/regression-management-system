import { cn } from "@/lib/utils";
import type { ImportResult } from "../types/pack.types";

export function ImportResultSummary({ result }: { result: ImportResult }) {
  const items = [
    { label: "Added", value: result.added, tone: "bg-success-soft text-success" },
    { label: "Modified", value: result.modified, tone: "bg-warning-soft text-warning" },
    { label: "Unchanged", value: result.unchanged, tone: "bg-neutral-soft text-neutral" },
    { label: "Removed", value: result.removed, tone: "bg-danger-soft text-danger" },
  ];

  return (
    <div className="space-y-3">
      <p className="text-sm">
        Imported <span className="font-semibold">{result.total} tests</span> as version <span className="font-semibold">v{result.versionNumber}</span>.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((i) => (
          <div key={i.label} className={cn("rounded-lg p-3 text-center", i.tone)}>
            <p className="text-xl font-semibold tabular-nums">{i.value}</p>
            <p className="text-xs">{i.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
