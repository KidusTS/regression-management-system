import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./Skeleton";

export function StatCard({ label, value, icon: Icon, href, loading, tone = "bg-accent text-accent-foreground", hint }: {
  label: string; value: React.ReactNode; icon: LucideIcon; href?: string; loading?: boolean; tone?: string; hint?: string;
}) {
  const body = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-lg", tone)}><Icon className="size-[18px]" aria-hidden /></span>
      </div>
      {loading ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>}
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </>
  );
  const cls = "bg-card block rounded-xl border p-5 shadow-sm transition-all";
  return href
    ? <Link href={href} className={cn(cls, "hover:border-primary/40 hover:shadow-md")}>{body}</Link>
    : <div className={cls}>{body}</div>;
}
