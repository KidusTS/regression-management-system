"use client";

import Link from "next/link";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { SessionStatusBadge } from "@/features/regression-sessions/components/SessionStatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: packs, isLoading: packsLoading } = usePacks();

  const activeSessions = sessions?.filter((s) => s.status === "IN_PROGRESS") ?? [];
  const completedSessions = sessions?.filter((s) => s.status === "COMPLETED") ?? [];

  const overallPassRate = (() => {
    if (!completedSessions.length) return null;
    const total = completedSessions.reduce((sum, s) => sum + s.totalTests, 0);
    const passed = completedSessions.reduce((sum, s) => sum + s.passed, 0);
    return total > 0 ? ((passed / total) * 100).toFixed(1) : null;
  })();

  const recentPacks = [...(packs ?? [])].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  const stats = [
    { label: "Regression Packs", value: packs?.length ?? "—", href: "/regression-packs" },
    { label: "Active Sessions", value: activeSessions.length, href: "/regression-sessions" },
    { label: "Completed Sessions", value: completedSessions.length, href: "/regression-sessions" },
    { label: "Overall Pass Rate", value: overallPassRate ? `${overallPassRate}%` : "—", href: "/reports" },
  ];

  const isLoading = sessionsLoading || packsLoading;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Overview of your regression testing activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="bg-muted/40 hover:bg-muted/70 rounded-xl border p-5 transition-colors"
          >
            <p className="text-3xl font-bold">{isLoading ? "—" : s.value}</p>
            <p className="text-muted-foreground mt-1 text-sm">{s.label}</p>
          </Link>
        ))}
      </div>

      {/* Active sessions */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Active Sessions</h2>
          <Link href="/regression-sessions" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted">
            View all
          </Link>
        </div>

        {sessionsLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

        {!sessionsLoading && activeSessions.length === 0 && (
          <p className="text-muted-foreground text-sm">No sessions currently in progress.</p>
        )}

        {activeSessions.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Pack</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Pass / Fail / Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSessions.map((s) => (
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
                  <TableCell className="text-sm">
                    <span className="text-green-600">{s.passed}</span>
                    {" / "}
                    <span className="text-destructive">{s.failed}</span>
                    {" / "}
                    <span>{s.totalTests}</span>
                  </TableCell>
                  <TableCell>
                    <SessionStatusBadge status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Recent packs */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Recent Packs</h2>
          <Link href="/regression-packs" className="inline-flex h-7 items-center rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted">
            View all
          </Link>
        </div>

        {packsLoading && <p className="text-muted-foreground text-sm">Loading...</p>}

        {!packsLoading && recentPacks.length === 0 && (
          <p className="text-muted-foreground text-sm">No regression packs yet.</p>
        )}

        {recentPacks.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Versions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPacks.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/regression-packs/${p.id}`} className="font-medium hover:underline">
                      {p.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{p.project ?? "—"}</TableCell>
                  <TableCell>{p.versionCount}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
