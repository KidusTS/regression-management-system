"use client";
/* eslint-disable react-hooks/set-state-in-effect -- intentional: hydrate from localStorage / reset form when dialog opens */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createSessionSchema, type CreateSessionFormValues } from "../schemas/session.schemas";
import { useCreateSession } from "../hooks/useSession.mutations";
import { usePacks } from "@/features/regression-packs/hooks/usePacks";
import { usePackVersions } from "@/features/regression-packs/hooks/usePackVersions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, selectClass } from "@/components/shared/Field";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function CreateSessionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { mutate: create, isPending } = useCreateSession();
  const { data: packs } = usePacks();
  const [selectedPackId, setSelectedPackId] = useState("");
  const { data: versions } = usePackVersions(selectedPackId);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateSessionFormValues>({ resolver: zodResolver(createSessionSchema) });

  useEffect(() => {
    if (open) { reset(); setSelectedPackId(""); }
  }, [open, reset]);

  // Preselect the newest version once a pack is chosen.
  useEffect(() => {
    if (versions?.length) {
      const latest = [...versions].sort((a, b) => b.versionNumber - a.versionNumber)[0];
      setValue("packVersionId", latest.id, { shouldValidate: true });
    }
  }, [versions, setValue]);

  const onSubmit = (data: CreateSessionFormValues) =>
    create(data, {
      onSuccess: (s) => {
        toast.success("Session created");
        onClose();
        if (s?.id) router.push(`/regression-sessions/${s.id}`);
      },
      onError: () => toast.error("Couldn't create the session. Please try again."),
    });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New regression session</DialogTitle>
          <DialogDescription>Pick a pack version to run against a build.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Field label="Name" error={errors.name?.message}>
            {(id) => <Input id={id} autoFocus placeholder="e.g. Sprint 42 regression" aria-invalid={!!errors.name} {...register("name")} />}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Regression pack">
              {(id) => (
                <select
                  id={id} className={selectClass} value={selectedPackId}
                  onChange={(e) => { setSelectedPackId(e.target.value); setValue("packVersionId", ""); }}
                >
                  <option value="">Select…</option>
                  {packs?.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              )}
            </Field>
            <Field label="Version" error={errors.packVersionId?.message}>
              {(id) => (
                <select id={id} className={selectClass} disabled={!selectedPackId || !versions?.length} {...register("packVersionId")}>
                  <option value="">{selectedPackId && versions && !versions.length ? "No versions" : "Select…"}</option>
                  {versions?.map((v) => <option key={v.id} value={v.id}>v{v.versionNumber} ({v.testCount} tests)</option>)}
                </select>
              )}
            </Field>
          </div>
          {selectedPackId && versions && versions.length === 0 && (
            <p className="bg-warning-soft text-warning rounded-lg px-3 py-2 text-xs">This pack has no versions yet. Import an Excel file into it first.</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Build / version" optional>{(id) => <Input id={id} placeholder="e.g. 2.4.1" {...register("softwareVersion")} />}</Field>
            <Field label="Environment" optional>{(id) => <Input id={id} placeholder="e.g. Staging" {...register("environment")} />}</Field>
          </div>
          <Field label="Description" optional>{(id) => <Input id={id} {...register("description")} />}</Field>

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending ? "Creating…" : "Create session"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
