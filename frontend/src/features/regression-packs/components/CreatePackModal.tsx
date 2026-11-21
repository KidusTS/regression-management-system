"use client";
/* eslint-disable react-hooks/set-state-in-effect -- intentional: hydrate from localStorage / reset form when dialog opens */

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { packSchema, type PackFormValues } from "../schemas/pack.schemas";
import { useCreatePack, useCreatePackWithImport, useUpdatePack } from "../hooks/usePack.mutations";
import { ImportResultSummary } from "./ImportResultSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/Field";
import { FileDrop } from "@/components/shared/FileDrop";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ImportResult, RegressionPack } from "../types/pack.types";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: RegressionPack | null;
}

export function CreatePackModal({ open, onClose, editing }: Props) {
  const isEdit = !!editing;
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  const { mutate: create, isPending: creating } = useCreatePack();
  const { mutate: createWithImport, isPending: creatingWithImport } = useCreatePackWithImport();
  const { mutate: update, isPending: updating } = useUpdatePack(editing?.id ?? "");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PackFormValues>({ resolver: zodResolver(packSchema) });

  useEffect(() => {
    if (open) {
      reset(editing ? { name: editing.name, description: editing.description ?? "", project: editing.project ?? "" } : {});
      setFile(null);
      setImportResult(null);
    }
  }, [open, editing, reset]);

  const fail = () => toast.error("Something went wrong. Please try again.");

  const onSubmit = (data: PackFormValues) => {
    if (isEdit) return update(data, { onSuccess: () => { toast.success("Pack updated"); onClose(); }, onError: fail });
    if (file) return createWithImport({ data, file }, { onSuccess: (r) => { toast.success("Pack created"); setImportResult(r); }, onError: fail });
    create(data, { onSuccess: () => { toast.success("Pack created"); onClose(); }, onError: fail });
  };

  const isPending = creating || creatingWithImport || updating;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        {importResult ? (
          <>
            <DialogHeader><DialogTitle>Pack created</DialogTitle></DialogHeader>
            <ImportResultSummary result={importResult} />
            <div className="flex justify-end pt-2"><Button onClick={onClose}>Done</Button></div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Edit pack" : "New regression pack"}</DialogTitle>
              {!isEdit && <DialogDescription>Optionally attach an Excel file to import version 1 right away.</DialogDescription>}
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Field label="Name" error={errors.name?.message}>
                {(id) => <Input id={id} autoFocus placeholder="e.g. Checkout flow" aria-invalid={!!errors.name} {...register("name")} />}
              </Field>
              <Field label="Project" optional>
                {(id) => <Input id={id} placeholder="e.g. E-commerce" {...register("project")} />}
              </Field>
              <Field label="Description" optional>
                {(id) => <Input id={id} placeholder="What does this pack cover?" {...register("description")} />}
              </Field>
              {!isEdit && (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium">Excel file <span className="text-muted-foreground font-normal">(optional)</span></p>
                  <FileDrop file={file} onChange={setFile} />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (file ? "Creating & importing…" : "Saving…") : isEdit ? "Save changes" : file ? "Create & import" : "Create pack"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
