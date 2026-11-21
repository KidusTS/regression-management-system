import { cn } from "@/lib/utils";
import type { StatusMeta } from "@/lib/status";

export function StatusPill({ meta, className, iconOnly }: { meta: StatusMeta; className?: string; iconOnly?: boolean }) {
  const Icon = meta.icon;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap", meta.tone, className)}>
      <Icon className="size-3.5" aria-hidden />
      {iconOnly ? <span className="sr-only">{meta.label}</span> : meta.label}
    </span>
  );
}
