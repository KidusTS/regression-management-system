import { api } from "@/services/api";
import type {
  RegressionPack,
  RegressionPackVersion,
  RegressionTestVersion,
  ImportResult,
  CreatePackRequest,
} from "../types/pack.types";

const base = "/regression-packs";

export const packService = {
  getAll: async (): Promise<RegressionPack[]> => {
    const res = await api.get<{ data: RegressionPack[] }>(base);
    return res.data.data;
  },

  getById: async (id: string): Promise<RegressionPack> => {
    const res = await api.get<{ data: RegressionPack }>(`${base}/${id}`);
    return res.data.data;
  },

  create: async (data: CreatePackRequest): Promise<RegressionPack> => {
    const res = await api.post<{ data: RegressionPack }>(base, data);
    return res.data.data;
  },

  update: async (id: string, data: CreatePackRequest): Promise<RegressionPack> => {
    const res = await api.put<{ data: RegressionPack }>(`${base}/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${base}/${id}`);
  },

  getVersions: async (id: string): Promise<RegressionPackVersion[]> => {
    const res = await api.get<{ data: RegressionPackVersion[] }>(`${base}/${id}/versions`);
    return res.data.data;
  },

  getVersion: async (id: string, versionId: string): Promise<RegressionPackVersion> => {
    const res = await api.get<{ data: RegressionPackVersion }>(`${base}/${id}/versions/${versionId}`);
    return res.data.data;
  },

  getVersionTests: async (id: string, versionId: string): Promise<RegressionTestVersion[]> => {
    const res = await api.get<{ data: RegressionTestVersion[] }>(
      `${base}/${id}/versions/${versionId}/tests`
    );
    return res.data.data;
  },

  importExcel: async (id: string, file: File): Promise<ImportResult> => {
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ data: ImportResult }>(`${base}/${id}/import`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },
};
