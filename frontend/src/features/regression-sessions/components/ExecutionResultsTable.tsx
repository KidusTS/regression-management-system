"use client";

import { useState } from "react";
import { useUpdateResult } from "../hooks/useSession.mutations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { RESULT_META } from "@/lib/status";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ExecutionResult, ResultValue } from "../types/session.types";

const QUICK: ResultValue[] = ["PASS", "FAIL", "BLOCKED", "SKIPPED"];
const activeTone: Record<ResultValue, string> = {
  PASS: "bg-success text-white",
  FAIL: "bg-danger text-white",
  BLOCKED: "bg-orange-500 text-white",
  SKIPPED: "bg-info text-white",
  NOT_RUN: "",
};

export function ExecutionResultsTable({ sessionId, results, readOnly }: { sessionId: string; results: ExecutionResult[]; readOnly?: boolean }) {
  const [comments, setComments] = useState<Record<string, string>>({});
  const { mutate: updateResult } = useUpdateResult(sessionId);

  const save = (r: ExecutionResult, patch: { result?: ResultValue; comment?: string }) => {
    const result = patch.result ?? r.result;
    const comment = patch.comment ?? comments[r.id] ?? r.comment ?? "";
    updateResult(
      { resultId: r.id, data: { result, comment: comment || undefined } },
      { onError: () => toast.error(`Couldn't save ${r.testIdRef}. Please try again.`) }
    );
  };

  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">ID</TableHead>
            <TableHead>Test</TableHead>
            <TableHead className="w-48">Result</TableHead>
            <TableHead className="min-w-56">Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => {
            const meta = RESULT_META[r.result];
            return (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.testIdRef}</TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm font-medium">{r.testTitle}</p>
                  {(r.module || r.feature) && (
                    <p className="text-muted-foreground text-xs">{[r.module, r.feature].filter(Boolean).join(" › ")}</p>
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", meta.tone)}>{meta.label}</span>
                  ) : (
                    <div className="inline-flex overflow-hidden rounded-lg border" role="group" aria-label={`Result for ${r.testIdRef}`}>
                      {QUICK.map((v) => {
                        const Icon = RESULT_META[v].icon;
                        const active = r.result === v;
                        return (
                          <button
                            key={v}
                            title={active ? `${RESULT_META[v].label} (click to reset)` : RESULT_META[v].label}
                            aria-label={RESULT_META[v].label}
                            aria-pressed={active}
                            onClick={() => save(r, { result: active ? "NOT_RUN" : v })}
                            className={cn(
                              "flex size-8 items-center justify-center border-r transition-colors last:border-r-0",
                              active ? activeTone[v] : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Input
                    className="h-8 text-sm"
                    aria-label={`Comment for ${r.testIdRef}`}
                    disabled={readOnly}
                    value={comments[r.id] ?? r.comment ?? ""}
                    onChange={(e) => setComments((p) => ({ ...p, [r.id]: e.target.value }))}
                    onBlur={() => {
                      if (r.id in comments && comments[r.id] !== (r.comment ?? "")) save(r, { comment: comments[r.id] });
                    }}
                    placeholder="Add a note…"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
