"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useImportPack } from "../hooks/usePack.mutations";
import { ImportResultSummary } from "./ImportResultSummary";
import { FileDrop } from "@/components/shared/FileDrop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ImportResult } from "../types/pack.types";

interface Props {
  packId: string;
  packName: string;
  nextVersionNumber: number;
  open: boolean;
  onClose: () => void;
}

export function ImportPackModal({ packId, packName, nextVersionNumber, open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { mutate: importPack, isPending, error, reset } = useImportPack(packId);

  const handleImport = () => {
    if (!file) return;
    setValidationErrors([]);
    importPack(file, {
      onSuccess: (data) => { setResult(data); toast.success(`Version ${data.versionNumber} imported`); },
      onError: (err) => {
        if (axios.isAxiosError(err)) {
          const errors = err.response?.data?.data?.errors;
          if (Array.isArray(errors) && errors.length > 0) setValidationErrors(errors);
        }
      },
    });
  };

  const handleClose = () => {
    setResult(null);
    setFile(null);
    setValidationErrors([]);
    reset();
    onClose();
  };

  const genericError =
    validationErrors.length === 0 && error
      ? axios.isAxiosError(error) ? error.response?.data?.message ?? "Import failed" : "Import failed"
      : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import new version</DialogTitle>
          <DialogDescription>
            Uploading a workbook creates <span className="text-foreground font-medium">v{nextVersionNumber}</span> of {packName}.
            Tests are compared with the previous version and tagged as added, modified or unchanged.
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <FileDrop file={file} onChange={(f) => { setFile(f); setValidationErrors([]); reset(); }} />
            {validationErrors.length > 0 && (
              <div role="alert" className="bg-danger-soft text-danger max-h-48 space-y-1 overflow-y-auto rounded-lg p-3">
                <p className="text-sm font-medium">Import rejected. Fix these rows and try again:</p>
                <ul className="list-inside list-disc space-y-0.5 text-xs">{validationErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </div>
            )}
            {genericError && <p role="alert" className="bg-danger-soft text-danger rounded-lg px-3 py-2 text-sm">{genericError}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleImport} disabled={!file || isPending}>{isPending ? "Importing…" : "Import"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ImportResultSummary result={result} />
            <div className="flex justify-end"><Button onClick={handleClose}>Done</Button></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
