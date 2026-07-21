import { api } from "@/services/api";
import type {
  RegressionSession,
  ExecutionResult,
  CreateSessionRequest,
  UpdateResultRequest,
  BulkUpdateResultRequest,
} from "../types/session.types";

const base = "/regression-sessions";

export const sessionService = {
  getAll: async (): Promise<RegressionSession[]> => {
    const res = await api.get<{ data: RegressionSession[] }>(base);
    return res.data.data;
  },

  getById: async (id: string): Promise<RegressionSession> => {
    const res = await api.get<{ data: RegressionSession }>(`${base}/${id}`);
    return res.data.data;
  },

  create: async (data: CreateSessionRequest): Promise<RegressionSession> => {
    const res = await api.post<{ data: RegressionSession }>(base, data);
    return res.data.data;
  },

  updateStatus: async (id: string, status: string): Promise<RegressionSession> => {
    const res = await api.put<{ data: RegressionSession }>(`${base}/${id}/status`, { status });
    return res.data.data;
  },

  getResults: async (id: string): Promise<ExecutionResult[]> => {
    const res = await api.get<{ data: ExecutionResult[] }>(`${base}/${id}/results`);
    return res.data.data;
  },

  updateResult: async (
    sessionId: string,
    resultId: string,
    data: UpdateResultRequest
  ): Promise<ExecutionResult> => {
    const res = await api.put<{ data: ExecutionResult }>(
      `${base}/${sessionId}/results/${resultId}`,
      data
    );
    return res.data.data;
  },

  bulkUpdateResults: async (
    sessionId: string,
    data: BulkUpdateResultRequest
  ): Promise<ExecutionResult[]> => {
    const res = await api.put<{ data: ExecutionResult[] }>(
      `${base}/${sessionId}/results/bulk`,
      data
    );
    return res.data.data;
  },
};
