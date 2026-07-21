"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { packSchema, type PackFormValues } from "../schemas/pack.schemas";
import { useCreatePack, useUpdatePack } from "../hooks/usePack.mutations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RegressionPack } from "../types/pack.types";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: RegressionPack | null;
}

export function CreatePackModal({ open, onClose, editing }: Props) {
  const isEdit = !!editing;
  const { mutate: create, isPending: creating } = useCreatePack();
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
    }
  }, [open, editing, reset]);

  const onSubmit = (data: PackFormValues) => {
    const cb = { onSuccess: onClose };
    isEdit ? update(data, cb) : create(data, cb);
  };

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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? "Saving..." : isEdit ? "Save changes" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
