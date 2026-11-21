"use client";

import Link from "next/link";
import { useState } from "react";
import { Activity, CheckCircle2, Layers, PlayCircle, Plus, Percent, ArrowRight } from "lucide-react";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { SessionsTable } from "@/features/regression-sessions/components/SessionsTable";
import { CreateSessionModal } from "@/features/regression-sessions/components/CreateSessionModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();
  const { data: packs, isLoading: packsLoading } = usePacks();
  const [newSession, setNewSession] = useState(false);

  const active = sessions?.filter((s) => s.status === "IN_PROGRESS") ?? [];
  const completed = sessions?.filter((s) => s.status === "COMPLETED") ?? [];
  const total = completed.reduce((n, s) => n + s.totalTests, 0);
  const passed = completed.reduce((n, s) => n + s.passed, 0);
  const passRate = total > 0 ? `${((passed / total) * 100).toFixed(1)}%` : "—";

  const recent = [...(sessions ?? [])]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const loading = sessionsLoading || packsLoading;

  return (
    <>
      <PageHeader
        title={`${greeting}${user?.firstName ? `, ${user.firstName}` : ""}`}
        description="Here's where your regression testing stands."
        actions={<Button onClick={() => setNewSession(true)}><Plus aria-hidden /> New session</Button>}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Regression packs" value={packs?.length ?? 0} icon={Layers} href="/regression-packs" loading={loading} />
        <StatCard label="In progress" value={active.length} icon={PlayCircle} href="/regression-sessions" loading={loading} tone="bg-warning-soft text-warning" />
        <StatCard label="Completed" value={completed.length} icon={CheckCircle2} href="/regression-sessions" loading={loading} tone="bg-success-soft text-success" />
        <StatCard label="Overall pass rate" value={passRate} icon={Percent} href="/reports" loading={loading} tone="bg-info-soft text-info" hint="Across completed sessions" />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent sessions</h2>
          <Link href="/regression-sessions" className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline">
            View all <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        {sessionsLoading ? <TableSkeleton rows={4} /> : recent.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No sessions yet"
            description={packs?.length ? "Start a session to run a pack against a build." : "Create a regression pack first, then start a session from it."}
            action={packs?.length
              ? <Button onClick={() => setNewSession(true)}><Plus aria-hidden /> New session</Button>
              : <Link href="/regression-packs"><Button><Layers aria-hidden /> Go to packs</Button></Link>}
          />
        ) : <SessionsTable sessions={recent} compact />}
      </section>

      <CreateSessionModal open={newSession} onClose={() => setNewSession(false)} />
    </>
  );
}
