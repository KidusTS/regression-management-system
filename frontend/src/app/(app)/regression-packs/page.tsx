"use client";

import { useMemo, useState } from "react";
import { Layers, Plus } from "lucide-react";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { PacksTable } from "@/features/regression-packs/components/PacksTable";
import { CreatePackModal } from "@/features/regression-packs/components/CreatePackModal";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchInput } from "@/components/shared/SearchInput";
import { TableSkeleton } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import type { RegressionPack } from "@/features/regression-packs/types/pack.types";
import { usePermissions } from "@/lib/permissions";

export default function RegressionPacksPage() {
  const { canWrite } = usePermissions();
  const { data: packs, isLoading, error } = usePacks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RegressionPack | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (packs ?? []).filter(
      (p) =>
        !q ||
        [p.name, p.project, p.description].some((v) =>
          v?.toLowerCase().includes(q),
        ),
    );
  }, [packs, query]);

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="Regression packs"
        description="A pack is a versioned set of test cases, usually imported from Excel."
        actions={canWrite ? (<Button onClick={() => setModalOpen(true)}>
            <Plus aria-hidden /> New pack
          </Button>) : undefined}
      />

      {isLoading && <TableSkeleton />}
      {error && (
        <p
          role="alert"
          className="bg-danger-soft text-danger rounded-lg px-4 py-3 text-sm"
        >
          Couldn&apos;t load regression packs. Please try again.
        </p>
      )}

      {packs && packs.length === 0 && (
        <EmptyState
          icon={Layers}
          title="Create your first pack"
          description="Start from scratch, or attach an Excel file and we'll import the test cases for you."
          action={canWrite ? (<Button onClick={() => setModalOpen(true)}>
              <Plus aria-hidden /> New pack
            </Button>) : undefined}
        />
      )}

      {packs && packs.length > 0 && (
        <div className="space-y-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search packs…"
            className="sm:w-72"
          />
          {filtered.length === 0 ? (
            <p className="text-muted-foreground bg-card rounded-xl border px-4 py-10 text-center text-sm">
              No packs match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <PacksTable
              packs={filtered}
              onEdit={(p) => {
                setEditing(p);
                setModalOpen(true);
              }}
            />
          )}
        </div>
      )}

      <CreatePackModal
        open={modalOpen}
        onClose={closeModal}
        editing={editing}
      />
    </>
  );
}
