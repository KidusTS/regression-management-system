"use client";

import { useState } from "react";
import { useSessions } from "@/features/regression-sessions/hooks/useSession.queries";
import { SessionsTable } from "@/features/regression-sessions/components/SessionsTable";
import { CreateSessionModal } from "@/features/regression-sessions/components/CreateSessionModal";
import { Button } from "@/components/ui/button";

export default function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Regression Sessions</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track and execute regression test sessions
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Session</Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {error && <p className="text-destructive text-sm">Failed to load sessions.</p>}
      {sessions && sessions.length === 0 && (
        <p className="text-muted-foreground text-sm">No sessions yet. Create one to get started.</p>
      )}
      {sessions && sessions.length > 0 && <SessionsTable sessions={sessions} />}

      <CreateSessionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
