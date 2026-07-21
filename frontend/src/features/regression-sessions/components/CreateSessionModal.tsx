"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSessionSchema, type CreateSessionFormValues } from "../schemas/session.schemas";
import { useCreateSession } from "../hooks/useSession.mutations";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { usePackVersions } from "@/features/regression-packs/hooks/usePackVersions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateSessionModal({ open, onClose }: Props) {
  const { mutate: create, isPending } = useCreateSession();
  const { data: packs } = usePacks();
  const [selectedPackId, setSelectedPackId] = useState("");
  const { data: versions } = usePackVersions(selectedPackId);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateSessionFormValues>({ resolver: zodResolver(createSessionSchema) });

  useEffect(() => {
    if (open) {
      reset();
      setSelectedPackId("");
    }
  }, [open, reset]);

  const onSubmit = (data: CreateSessionFormValues) => {
    create(data, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Regression Session</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="e.g. Sprint 42 Regression" {...register("name")} />
            {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Regression Pack</label>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm"
              value={selectedPackId}
              onChange={(e) => {
                setSelectedPackId(e.target.value);
                setValue("packVersionId", "");
              }}
            >
              <option value="">Select a pack...</option>
              {packs?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Pack Version</label>
            <select
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
              disabled={!selectedPackId || !versions?.length}
              {...register("packVersionId")}
            >
              <option value="">Select a version...</option>
              {versions?.map((v) => (
                <option key={v.id} value={v.id}>
                  v{v.versionNumber}{v.label ? ` — ${v.label}` : ""} ({v.testCount} tests)
                </option>
              ))}
            </select>
            {errors.packVersionId && (
              <p className="text-destructive text-xs">{errors.packVersionId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Software Version</label>
              <Input placeholder="e.g. 2.4.1" {...register("softwareVersion")} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Environment</label>
              <Input placeholder="e.g. Staging" {...register("environment")} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <Input placeholder="Optional" {...register("description")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
