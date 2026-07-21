"use client";

import { useState } from "react";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { PacksTable } from "@/features/regression-packs/components/PacksTable";
import { CreatePackModal } from "@/features/regression-packs/components/CreatePackModal";
import { Button } from "@/components/ui/button";
import type { RegressionPack } from "@/features/regression-packs/types/pack.types";

export default function RegressionPacksPage() {
  const { data: packs, isLoading, error } = usePacks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RegressionPack | null>(null);

  const openEdit = (pack: RegressionPack) => {
    setEditing(pack);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Regression Packs</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your regression test packs and versions
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>New Pack</Button>
      </div>

      {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
      {error && <p className="text-destructive text-sm">Failed to load packs.</p>}
      {packs && packs.length === 0 && (
        <p className="text-muted-foreground text-sm">No regression packs yet. Create one to get started.</p>
      )}
      {packs && packs.length > 0 && <PacksTable packs={packs} onEdit={openEdit} />}

      <CreatePackModal open={modalOpen} onClose={closeModal} editing={editing} />
    </div>
  );
}
