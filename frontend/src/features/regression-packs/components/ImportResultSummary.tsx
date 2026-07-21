import type { ImportResult } from "../types/pack.types";

interface Props {
  result: ImportResult;
}

export function ImportResultSummary({ result }: Props) {
  const items = [
    { label: "Added", value: result.added, color: "text-green-600" },
    { label: "Modified", value: result.modified, color: "text-yellow-600" },
    { label: "Unchanged", value: result.unchanged, color: "text-muted-foreground" },
    { label: "Removed", value: result.removed, color: "text-destructive" },
    { label: "Total", value: result.total, color: "text-foreground font-semibold" },
  ];

  return (
    <div className="bg-muted/50 rounded-lg border p-4">
      <p className="mb-3 text-sm font-medium">
        Import complete — Version {result.versionNumber}
      </p>
      <div className="grid grid-cols-5 gap-2 text-center">
        {items.map((item) => (
          <div key={item.label}>
            <p className={`text-lg font-semibold ${item.color}`}>{item.value}</p>
            <p className="text-muted-foreground text-xs">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
