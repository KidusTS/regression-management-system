export interface RegressionPack {
  id: string;
  name: string;
  description: string | null;
  project: string | null;
  isActive: boolean;
  versionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegressionPackVersion {
  id: string;
  regressionPackId: string;
  versionNumber: number;
  label: string | null;
  sourceFileName: string | null;
  importSummary: Record<string, unknown> | null;
  testCount: number;
  createdAt: string;
}

export interface RegressionTestVersion {
  id: string;
  regressionTestId: string;
  testIdRef: string;
  versionNumber: number;
  module: string | null;
  feature: string | null;
  title: string;
  preconditions: string | null;
  testSteps: string | null;
  expectedResult: string | null;
  priority: string;
  automationStatus: string;
  status: string;
  changeType: string;
  createdAt: string;
}

export interface ImportResult {
  newVersionId: string;
  versionNumber: number;
  added: number;
  modified: number;
  unchanged: number;
  removed: number;
  total: number;
}

export interface CreatePackRequest {
  name: string;
  description?: string;
  project?: string;
}
