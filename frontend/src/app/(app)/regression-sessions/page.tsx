"use client";

import { useMemo, useState } from "react";
import { PlayCircle, Plus } from "lucide-react";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { SessionsTable } from "@/features/regression-sessions/components/SessionsTable";
import { CreateSessionModal } from "@/features/regression-sessions/components/CreateSessionModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SessionStatus } from "@/features/regression-sessions/types/session.types";

const FILTERS: { value: SessionStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PLANNED", label: "Planned" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ABORTED", label: "Aborted" },
];

export default function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SessionStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (sessions ?? []).filter(
      (s) =>
        (status === "ALL" || s.status === status) &&
        (!q ||
          [s.name, s.packName, s.softwareVersion, s.environment].some((v) =>
            v?.toLowerCase().includes(q),
          )),
    );
  }, [sessions, query, status]);

  const count = (v: SessionStatus | "ALL") =>
    (v === "ALL"
      ? sessions?.length
      : sessions?.filter((s) => s.status === v).length) ?? 0;

  return (
    <>
      <PageHeader
        title="Regression sessions"
        description="Run a pack against a specific build and record the results."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus aria-hidden /> New session
          </Button>
        }
      />

      {isLoading && <TableSkeleton />}
      {error && (
        <p
          role="alert"
          className="bg-danger-soft text-danger rounded-lg px-4 py-3 text-sm"
        >
          Couldn&apos;t load sessions. Please try again.
        </p>
      )}

      {sessions && sessions.length === 0 && (
        <EmptyState
          icon={PlayCircle}
          title="No sessions yet"
          description="A session runs one version of a regression pack against a software build."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <Plus aria-hidden /> New session
            </Button>
          }
        />
      )}

      {sessions && sessions.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex flex-wrap gap-1.5"
              role="group"
              aria-label="Filter by status"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatus(f.value)}
                  aria-pressed={status === f.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    status === f.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.label}{" "}
                  <span className="tabular-nums opacity-70">
                    {count(f.value)}
                  </span>
                </button>
              ))}
            </div>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search sessions…"
              className="sm:w-64"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-muted-foreground bg-card rounded-xl border px-4 py-10 text-center text-sm">
              No sessions match your filters.
            </p>
          ) : (
            <SessionsTable sessions={filtered} />
          )}
        </div>
      )}

      <CreateSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
