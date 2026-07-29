export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error: {
    code: string;
    details: string;
  } | null;
  timestamp: string;
}

export interface SystemHealthData {
  gasConnected: boolean;
  sheetsAccessible: boolean;
  existingSheets: string[];
  missingSheets: string[];
  lastInitializedAt: string | null;
  coreRecordsCount: number;
  databaseVersion: string;
  appVersion: string;
}
