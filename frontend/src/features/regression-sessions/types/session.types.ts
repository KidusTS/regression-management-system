export type SessionStatus = "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "ABORTED";
export type ResultValue = "NOT_RUN" | "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";

export interface RegressionSession {
  id: string;
  name: string;
  description: string | null;
  packVersionId: string;
  packVersionNumber: number;
  packName: string;
  softwareVersion: string | null;
  environment: string | null;
  status: SessionStatus;
  totalTests: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  notRun: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  id: string;
  sessionId: string;
  testVersionId: string;
  testIdRef: string;
  testTitle: string;
  module: string | null;
  feature: string | null;
  result: ResultValue;
  comment: string | null;
  executedAt: string | null;
  updatedAt: string;
}

export interface CreateSessionRequest {
  name: string;
  description?: string;
  packVersionId: string;
  softwareVersion?: string;
  environment?: string;
}

export interface UpdateResultRequest {
  result: ResultValue;
  comment?: string;
}

export interface BulkUpdateResultRequest {
  results: { resultId: string; result: ResultValue; comment?: string }[];
}
