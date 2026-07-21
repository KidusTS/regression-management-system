"use client";

import { useRef, useState } from "react";
import { useImportPack } from "../hooks/usePack.mutations";
import { ImportResultSummary } from "./ImportResultSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImportResult } from "../types/pack.types";

interface Props {
  packId: string;
  packName: string;
  open: boolean;
  onClose: () => void;
}

export function ImportPackModal({ packId, packName, open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const { mutate: importPack, isPending, error } = useImportPack(packId);

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    importPack(file, {
      onSuccess: (data) => setResult(data),
    });
  };

  const handleClose = () => {
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  const errorMessage = error instanceof Error ? error.message : error ? "Import failed" : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import Excel — {packName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!result ? (
            <>
              <div className="space-y-1">
                <label className="text-sm font-medium">Excel file (.xlsx)</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx"
                  className="text-sm file:mr-3 file:rounded-md file:border file:px-3 file:py-1 file:text-sm"
                />
              </div>
              {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={isPending}>
                  {isPending ? "Importing..." : "Import"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <ImportResultSummary result={result} />
              <div className="flex justify-end">
                <Button onClick={handleClose}>Done</Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
