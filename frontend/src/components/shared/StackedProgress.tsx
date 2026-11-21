import { cn } from "@/lib/utils";
import { RESULT_META, RESULT_ORDER } from "@/lib/status";
import type { ResultValue } from "@/features/regression-sessions/types/session.types";

type Counts = { passed: number; failed: number; blocked: number; skipped: number; notRun: number; totalTests: number };
const KEY: Record<ResultValue, keyof Counts> = { PASS: "passed", FAIL: "failed", BLOCKED: "blocked", SKIPPED: "skipped", NOT_RUN: "notRun" };

export function StackedProgress({ counts, className, height = "h-2" }: { counts: Counts; className?: string; height?: string }) {
  const total = counts.totalTests || 1;
  const done = counts.totalTests - counts.notRun;
  return (
    <div
      className={cn("bg-muted flex w-full overflow-hidden rounded-full", height, className)}
      role="progressbar" aria-valuemin={0} aria-valuemax={counts.totalTests} aria-valuenow={done}
      aria-label={`${done} of ${counts.totalTests} tests executed`}
    >
      {RESULT_ORDER.filter((r) => r !== "NOT_RUN").map((r) => {
        const n = counts[KEY[r]];
        return n > 0 ? <div key={r} className={cn(RESULT_META[r].solid, "transition-all duration-500")} style={{ width: `${(n / total) * 100}%` }} title={`${RESULT_META[r].label}: ${n}`} /> : null;
      })}
    </div>
  );
}
