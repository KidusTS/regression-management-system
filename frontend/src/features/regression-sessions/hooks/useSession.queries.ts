import { useQuery } from "@tanstack/react-query";
import { sessionService } from "../services/session.service";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: sessionService.getAll,
  });
}

export function useSessionDetail(id: string) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => sessionService.getById(id),
    enabled: !!id,
  });
}

export function useSessionResults(sessionId: string) {
  return useQuery({
    queryKey: ["sessions", sessionId, "results"],
    queryFn: () => sessionService.getResults(sessionId),
    enabled: !!sessionId,
  });
}
