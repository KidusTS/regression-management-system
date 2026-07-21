import { useMutation, useQueryClient } from "@tanstack/react-query";
import { packService } from "../services/pack.service";
import type { CreatePackRequest } from "../types/pack.types";

export function useCreatePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackRequest) => packService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useUpdatePack(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePackRequest) => packService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useDeletePack() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => packService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["packs"] }),
  });
}

export function useImportPack(packId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => packService.importExcel(packId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["packs", packId, "versions"] });
      qc.invalidateQueries({ queryKey: ["packs"] });
    },
  });
}
