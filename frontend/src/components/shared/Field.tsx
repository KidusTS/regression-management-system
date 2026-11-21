import { useId } from "react";

export function Field({ label, error, hint, optional, children }: {
  label: string; error?: string; hint?: string; optional?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional && <span className="text-muted-foreground font-normal">(optional)</span>}
      </label>
      {children(id)}
      {hint && !error && <p className="text-muted-foreground text-xs">{hint}</p>}
      {error && <p role="alert" className="text-destructive text-xs">{error}</p>}
    </div>
  );
}

export const selectClass =
  "border-input bg-card text-foreground focus-visible:ring-ring/50 focus-visible:border-ring h-9 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50";
