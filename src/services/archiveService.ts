import { archiveDb, AuditLogEntry, ArchivedRecord } from '../db/archiveDb';
import { v4 as uuidv4 } from 'uuid';
import { commissionService } from './commissionService';
import { quoteService } from './quoteService';
import { productService } from './productService';
import { employeeService } from './employeeService';
import { ApiClient } from './apiClient';

const getDeviceInfo = () => {
  return {
    userAgent: navigator.userAgent,
    browser: (navigator as any).userAgentData?.brands?.[0]?.brand || 'Unknown',
    os: (navigator as any).userAgentData?.platform || 'Unknown',
    deviceName: 'Web Browser',
  };
};

export const archiveService = {
  archiveRecord: async (
    entityType: ArchivedRecord['entityType'],
    record: any,
    reason: string,
    adminUser: { id: string; name: string; role: string },
    companyId: string
  ) => {
    const auditLogId = uuidv4();
    const deviceInfo = getDeviceInfo();
    const recordId = record.id || record.ProductID || record.EmployeeID || record.QuoteID || record.transactionNo;
    
    const auditLog: AuditLogEntry = {
      id: auditLogId,
      timestamp: new Date().toISOString(),
      adminUsername: adminUser.name,
      adminUserId: adminUser.id,
      userRole: adminUser.role,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: 'Logged by system',
      userAgent: deviceInfo.userAgent,
      archiveReason: reason,
      recordsCount: 1,
      recordIds: [recordId],
      entityType,
      action: 'ARCHIVE',
    };

    await archiveDb.auditLogs.add(auditLog);

    const archivedRecord: ArchivedRecord = {
      id: recordId,
      entityType,
      recordData: record,
      archivedAt: new Date().toISOString(),
      archiveReason: reason,
      archivedBy: adminUser.name,
      auditLogId,
    };

    await archiveDb.archivedRecords.put(archivedRecord);

    if (entityType === 'COMMISSION_RECORD') {
      await commissionService.deleteCommissionRecord(recordId);
    } else if (entityType === 'QUOTE') {
      await quoteService.deleteQuote(recordId, companyId);
    } else if (entityType === 'PRODUCT') {
      await productService.deleteProduct(recordId, companyId);
    } else if (entityType === 'EMPLOYEE') {
      await employeeService.deleteEmployee(recordId, companyId);
    } else if (entityType === 'VEHICLE') {
      await ApiClient.post('DELETE_VEHICLE', { 
        Vehicle_ID: recordId, 
        CompanyID: companyId,
        DeletedBy: adminUser.name,
        ArchiveReason: reason
      });
    }
    
    return { success: true };
  },

  restoreRecord: async (
    archivedRecordId: string,
    adminUser: { id: string; name: string; role: string },
    companyId: string
  ) => {
    const archivedRecord = await archiveDb.archivedRecords.get(archivedRecordId);
    if (!archivedRecord) throw new Error('Record not found in archive');

    const auditLogId = uuidv4();
    const deviceInfo = getDeviceInfo();
    
    const auditLog: AuditLogEntry = {
      id: auditLogId,
      timestamp: new Date().toISOString(),
      adminUsername: adminUser.name,
      adminUserId: adminUser.id,
      userRole: adminUser.role,
      deviceName: deviceInfo.deviceName,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      ipAddress: 'Logged by system',
      userAgent: deviceInfo.userAgent,
      archiveReason: 'Restored from Archive Center',
      recordsCount: 1,
      recordIds: [archivedRecord.id],
      entityType: archivedRecord.entityType,
      action: 'RESTORE',
    };

    await archiveDb.auditLogs.add(auditLog);

    let tableName = '';
    let idField = '';

    if (archivedRecord.entityType === 'COMMISSION_RECORD') {
      tableName = 'CommissionRecords';
      idField = 'id';
    } else if (archivedRecord.entityType === 'QUOTE') {
      tableName = 'Quotes';
      idField = 'QuoteID';
    } else if (archivedRecord.entityType === 'PRODUCT') {
      tableName = 'Products';
      idField = 'ProductID';
    } else if (archivedRecord.entityType === 'EMPLOYEE') {
      tableName = 'Employees';
      idField = 'EmployeeID';
    } else if (archivedRecord.entityType === 'VEHICLE') {
      tableName = 'Vehicles';
      idField = 'Vehicle_ID';
    }

    if (tableName) {
      await ApiClient.post('RESTORE_RECORD', { tableName, idField, idValue: archivedRecord.id });
    }
    
    await archiveDb.archivedRecords.delete(archivedRecord.id);

    return { success: true };
  },
  
  getArchivedRecords: async () => {
    return await archiveDb.archivedRecords.toArray();
  },
  
  getAuditLogs: async () => {
    return await archiveDb.auditLogs.toArray();
  },
  
  exportAuditLogs: async () => {
    const logs = await archiveDb.auditLogs.toArray();
    // In a real app, generate CSV/Excel here
    return logs;
  }
};
