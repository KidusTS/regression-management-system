"use client";

import Link from "next/link";
import { SessionStatusBadge } from "./SessionStatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RegressionSession } from "../types/session.types";

interface Props {
  sessions: RegressionSession[];
}

export function SessionsTable({ sessions }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Pack</TableHead>
          <TableHead>Environment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Pass / Fail / Total</TableHead>
          <TableHead>Created</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <Link href={`/regression-sessions/${s.id}`} className="font-medium hover:underline">
                {s.name}
              </Link>
              {s.softwareVersion && (
                <p className="text-muted-foreground text-xs">{s.softwareVersion}</p>
              )}
            </TableCell>
            <TableCell className="text-sm">
              {s.packName}
              <span className="text-muted-foreground ml-1 text-xs">v{s.packVersionNumber}</span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">{s.environment ?? "—"}</TableCell>
            <TableCell>
              <SessionStatusBadge status={s.status} />
            </TableCell>
            <TableCell className="text-sm">
              <span className="text-green-600">{s.passed}</span>
              {" / "}
              <span className="text-destructive">{s.failed}</span>
              {" / "}
              <span>{s.totalTests}</span>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {new Date(s.createdAt).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
