"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { packSchema, type PackFormValues } from "../schemas/pack.schemas";
import { useCreatePack, useCreatePackWithImport, useUpdatePack } from "../hooks/usePack.mutations";
import { ImportResultSummary } from "./ImportResultSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ImportResult, RegressionPack } from "../types/pack.types";
import { Paperclip, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: RegressionPack | null;
}

export function CreatePackModal({ open, onClose, editing }: Props) {
  const isEdit = !!editing;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { mutate: create, isPending: creating } = useCreatePack();
  const { mutate: createWithImport, isPending: creatingWithImport } = useCreatePackWithImport();
  const { mutate: update, isPending: updating } = useUpdatePack(editing?.id ?? "");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PackFormValues>({ resolver: zodResolver(packSchema) });

  useEffect(() => {
    if (open) {
      reset(editing ? { name: editing.name, description: editing.description ?? "", project: editing.project ?? "" } : {});
      setFile(null);
      setImportResult(null);
    }
  }, [open, editing, reset]);

  const onSubmit = (data: PackFormValues) => {
    if (isEdit) {
      update(data, { onSuccess: onClose });
      return;
    }
    if (file) {
      createWithImport({ data, file }, {
        onSuccess: (result) => setImportResult(result),
      });
    } else {
      create(data, { onSuccess: onClose });
    }
  };

  const isPending = creating || creatingWithImport || updating;

  if (importResult) {
    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Complete</DialogTitle>
          </DialogHeader>
          <ImportResultSummary result={importResult} />
          <div className="flex justify-end pt-2">
            <Button onClick={onClose}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pack" : "New Regression Pack"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="e.g. Checkout Flow" {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Project</label>
            <Input placeholder="e.g. E-Commerce" {...register("project")} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Optional description" {...register("description")} />
          </div>

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Excel File <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              {file ? (
                <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                  <Paperclip className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  <Paperclip className="size-4" />
                  Attach .xlsx file
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? file ? "Creating & importing..." : "Saving..."
                : isEdit ? "Save changes" : file ? "Create & import" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
