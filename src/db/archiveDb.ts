import Dexie, { Table } from 'dexie';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO String
  adminUsername: string;
  adminUserId: string;
  userRole: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  userAgent: string;
  archiveReason: string;
  recordsCount: number;
  recordIds: string[];
  entityType: string;
  action: 'ARCHIVE' | 'RESTORE';
}

export interface ArchivedRecord {
  id: string;
  entityType: 'COMMISSION_RECORD' | 'QUOTE' | 'PRODUCT' | 'EMPLOYEE' | 'OTHER';
  recordData: any;
  archivedAt: string; // ISO String
  archiveReason: string;
  archivedBy: string; // Admin username
  auditLogId: string;
}

export class ArchiveDatabase extends Dexie {
  auditLogs!: Table<AuditLogEntry>;
  archivedRecords!: Table<ArchivedRecord>;

  constructor() {
    super('ArchiveDatabase');
    this.version(1).stores({
      auditLogs: 'id, timestamp, adminUserId, entityType, action',
      archivedRecords: 'id, entityType, archivedAt, archivedBy, archiveReason, auditLogId',
    });
  }
}

export const archiveDb = new ArchiveDatabase();
