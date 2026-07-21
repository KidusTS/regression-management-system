import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/report.service";

export function useSessionSummary(sessionId: string) {
  return useQuery({
    queryKey: ["reports", "sessions", sessionId, "summary"],
    queryFn: () => reportService.getSessionSummary(sessionId),
    enabled: !!sessionId,
  });
}

export function usePackTrends(packId: string) {
  return useQuery({
    queryKey: ["reports", "packs", packId, "trends"],
    queryFn: () => reportService.getPackTrends(packId),
    enabled: !!packId,
  });
}
