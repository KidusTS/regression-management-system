export interface SessionSummary {
  sessionId: string;
  sessionName: string;
  total: number;
  passed: number;
  failed: number;
  blocked: number;
  skipped: number;
  notRun: number;
  passRate: number;
}

export interface TrendReport {
  sessionId: string;
  sessionName: string;
  softwareVersion: string | null;
  total: number;
  passed: number;
  passRate: number;
  createdAt: string;
}
