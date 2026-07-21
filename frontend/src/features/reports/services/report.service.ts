import { api } from "@/services/api";
import type { SessionSummary, TrendReport } from "../types/report.types";

export const reportService = {
  getSessionSummary: async (sessionId: string): Promise<SessionSummary> => {
    const res = await api.get<{ data: SessionSummary }>(`/reports/sessions/${sessionId}/summary`);
    return res.data.data;
  },

  getPackTrends: async (packId: string): Promise<TrendReport[]> => {
    const res = await api.get<{ data: TrendReport[] }>(`/reports/packs/${packId}/trends`);
    return res.data.data;
  },
};
