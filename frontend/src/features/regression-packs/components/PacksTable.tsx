"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/permissions";
import { useDeletePack } from "../hooks/usePack.mutations";
import type { RegressionPack } from "../types/pack.types";

export function PacksTable({ packs, onEdit }: { packs: RegressionPack[]; onEdit: (pack: RegressionPack) => void }) {
  const { canWrite, canManage } = usePermissions();
  const { mutate: deletePack, isPending } = useDeletePack();
  const [toDelete, setToDelete] = useState<RegressionPack | null>(null);

  return (
    <>
      <div className="bg-card overflow-hidden rounded-xl border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pack</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Versions</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packs.map((pack) => (
              <TableRow key={pack.id}>
                <TableCell className="max-w-sm">
                  <Link href={`/regression-packs/${pack.id}`} className="font-medium hover:underline">{pack.name}</Link>
                  {!pack.isActive && (
                    <span className={cn("bg-neutral-soft text-neutral ml-2 rounded-full px-2 py-0.5 text-xs")}>Inactive</span>
                  )}
                  {pack.description && <p className="text-muted-foreground truncate text-xs">{pack.description}</p>}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{pack.project ?? "—"}</TableCell>
                <TableCell className="tabular-nums">{pack.versionCount}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(pack.updatedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    {canWrite && (<Button variant="ghost" size="icon" aria-label={`Edit ${pack.name}`} title="Edit" onClick={() => onEdit(pack)}>
                      <Pencil aria-hidden />
                    </Button>)}
                    {canManage && (<Button variant="ghost" size="icon" aria-label={`Delete ${pack.name}`} title="Delete" className="text-destructive hover:text-destructive" onClick={() => setToDelete(pack)}>
                      <Trash2 aria-hidden />
                    </Button>)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        destructive
        title={`Delete "${toDelete?.name}"?`}
        description="This removes the pack and its versions. Sessions that used it may be affected. This can't be undone."
        confirmLabel="Delete pack"
        pending={isPending}
        onCancel={() => setToDelete(null)}
        onConfirm={() =>
          toDelete && deletePack(toDelete.id, {
            onSuccess: () => { toast.success("Pack deleted"); setToDelete(null); },
            onError: () => toast.error("Couldn't delete the pack. It may still be used by a session."),
          })
        }
      />
    </>
  );
}
