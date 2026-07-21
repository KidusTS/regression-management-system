import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService } from "../services/session.service";
import type { CreateSessionRequest, UpdateResultRequest, BulkUpdateResultRequest } from "../types/session.types";

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSessionRequest) => sessionService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}

export function useUpdateSessionStatus(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: string) => sessionService.updateStatus(sessionId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions", sessionId] }),
  });
}

export function useUpdateResult(sessionId: string, onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ resultId, data }: { resultId: string; data: UpdateResultRequest }) =>
      sessionService.updateResult(sessionId, resultId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", sessionId, "results"] });
      qc.invalidateQueries({ queryKey: ["sessions", sessionId] });
      onSuccess?.();
    },
  });
}

export function useBulkUpdateResults(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkUpdateResultRequest) =>
      sessionService.bulkUpdateResults(sessionId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sessions", sessionId, "results"] });
      qc.invalidateQueries({ queryKey: ["sessions", sessionId] });
    },
  });
}
