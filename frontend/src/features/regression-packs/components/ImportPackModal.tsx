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
import axios from "axios";

interface Props {
  packId: string;
  packName: string;
  nextVersionNumber: number;
  open: boolean;
  onClose: () => void;
}

export function ImportPackModal({ packId, packName, nextVersionNumber, open, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { mutate: importPack, isPending, error } = useImportPack(packId);

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setValidationErrors([]);
    importPack(file, {
      onSuccess: (data) => setResult(data),
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          const errors = err.response?.data?.data?.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            setValidationErrors(errors);
            return;
          }
        }
      },
    });
  };

  const handleClose = () => {
    setResult(null);
    setValidationErrors([]);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  const genericError =
    validationErrors.length === 0 && error
      ? axios.isAxiosError(error)
        ? error.response?.data?.message ?? "Import failed"
        : "Import failed"
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import New Version — {packName}</DialogTitle>
          <p className="text-muted-foreground text-sm">
            Uploading an Excel file will create <span className="text-foreground font-medium">v{nextVersionNumber}</span>.
            Tests will be diffed against the previous version and tagged as added, modified, or unchanged.
          </p>
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
              {validationErrors.length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 space-y-1">
                  <p className="text-destructive text-sm font-medium">Validation errors — import rejected</p>
                  <ul className="text-destructive text-xs space-y-0.5 list-disc list-inside">
                    {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              {genericError && <p className="text-destructive text-sm">{genericError}</p>}
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
