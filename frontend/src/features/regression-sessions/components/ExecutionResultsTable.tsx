"use client";

import { useState } from "react";
import { useUpdateResult } from "../hooks/useSession.mutations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ExecutionResult, ResultValue } from "../types/session.types";

const RESULTS: ResultValue[] = ["NOT_RUN", "PASSED", "FAILED", "BLOCKED", "SKIPPED"];

const resultStyle: Record<ResultValue, string> = {
  NOT_RUN: "border-gray-300 text-gray-500",
  PASSED: "border-green-500 text-green-600",
  FAILED: "border-red-500 text-red-600",
  BLOCKED: "border-orange-400 text-orange-600",
  SKIPPED: "border-yellow-400 text-yellow-600",
};

interface RowState {
  result: ResultValue;
  comment: string;
}

interface Props {
  sessionId: string;
  results: ExecutionResult[];
}

export function ExecutionResultsTable({ sessionId, results }: Props) {
  const { mutate: updateResult } = useUpdateResult(sessionId);
  const [editing, setEditing] = useState<Record<string, RowState>>({});

  const getRow = (r: ExecutionResult): RowState =>
    editing[r.id] ?? { result: r.result, comment: r.comment ?? "" };

  const setRow = (id: string, patch: Partial<RowState>) =>
    setEditing((prev) => ({ ...prev, [id]: { ...getRow(results.find((r) => r.id === id)!), ...prev[id], ...patch } }));

  const commit = (r: ExecutionResult) => {
    const row = getRow(r);
    if (row.result !== r.result || row.comment !== (r.comment ?? "")) {
      updateResult({ resultId: r.id, data: { result: row.result, comment: row.comment || undefined } });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Module</TableHead>
            <TableHead>Feature</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Result</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.map((r) => {
            const row = getRow(r);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.testIdRef}</TableCell>
                <TableCell className="text-sm">{r.module ?? "—"}</TableCell>
                <TableCell className="text-sm">{r.feature ?? "—"}</TableCell>
                <TableCell className="max-w-xs truncate text-sm">{r.testTitle}</TableCell>
                <TableCell>
                  <select
                    className="border-input bg-background rounded-md border px-2 py-1 text-xs"
                    value={row.result}
                    onChange={(e) => {
                      const val = e.target.value as ResultValue;
                      setRow(r.id, { result: val });
                      updateResult({ resultId: r.id, data: { result: val, comment: row.comment || undefined } });
                    }}
                  >
                    {RESULTS.map((v) => (
                      <option key={v} value={v}>{v.replace("_", " ")}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <Input
                    className="h-7 text-xs"
                    value={row.comment}
                    onChange={(e) => setRow(r.id, { comment: e.target.value })}
                    onBlur={() => commit(r)}
                    placeholder="Add comment..."
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
