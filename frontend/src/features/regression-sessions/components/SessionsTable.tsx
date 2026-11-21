"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { SessionStatusBadge } from "./SessionStatusBadge";
import { StackedProgress } from "@/components/shared/StackedProgress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { RegressionSession } from "../types/session.types";

export function SessionsTable({ sessions, compact }: { sessions: RegressionSession[]; compact?: boolean }) {
  const router = useRouter();
  return (
    <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Session</TableHead>
            <TableHead>Pack</TableHead>
            {!compact && <TableHead>Environment</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="min-w-40">Progress</TableHead>
            {!compact && <TableHead>Created</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s) => {
            const done = s.totalTests - s.notRun;
            return (
              <TableRow key={s.id} className="cursor-pointer" onClick={() => router.push(`/regression-sessions/${s.id}`)}>
                <TableCell>
                  <Link href={`/regression-sessions/${s.id}`} onClick={(e) => e.stopPropagation()} className="font-medium hover:underline">{s.name}</Link>
                  {s.softwareVersion && <p className="text-muted-foreground text-xs">Build {s.softwareVersion}</p>}
                </TableCell>
                <TableCell className="text-sm">
                  {s.packName} <span className="text-muted-foreground text-xs">v{s.packVersionNumber}</span>
                </TableCell>
                {!compact && <TableCell className="text-muted-foreground text-sm">{s.environment ?? "—"}</TableCell>}
                <TableCell><SessionStatusBadge status={s.status} /></TableCell>
                <TableCell>
                  <StackedProgress counts={s} />
                  <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
                    {done}/{s.totalTests} run · <span className="text-success">{s.passed} pass</span> · <span className="text-danger">{s.failed} fail</span>
                  </p>
                </TableCell>
                {!compact && <TableCell className="text-muted-foreground text-sm">{new Date(s.createdAt).toLocaleDateString()}</TableCell>}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
