import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types/responses';
import {
  CompanyDocument,
  DocumentCategory,
  DocumentType,
  DocumentRenewalRecord,
  DocumentKPIs,
} from '@/types/documents';
import {
  INITIAL_DOCUMENT_CATEGORIES,
  INITIAL_DOCUMENT_TYPES,
  INITIAL_COMPANY_DOCUMENTS,
} from '@/data/documentMasterData';
import { calculateDocumentExpiry } from '@/utils/documentExpiry';

const LOCAL_STORAGE_DOCS_KEY = 'nmo_company_documents_v1';
const LOCAL_STORAGE_TYPES_KEY = 'nmo_document_types_v1';
const LOCAL_STORAGE_CATS_KEY = 'nmo_document_categories_v1';
const LOCAL_STORAGE_RENEWAL_KEY = 'nmo_document_renewals_v1';

// Helper to normalize JSON custom fields and nested objects
export function normalizeDocument(raw: any): CompanyDocument {
  let customData = {};
  if (raw.Custom_Fields_JSON) {
    try {
      customData = typeof raw.Custom_Fields_JSON === 'string' 
        ? JSON.parse(raw.Custom_Fields_JSON) 
        : raw.Custom_Fields_JSON;
    } catch {
      customData = {};
    }
  }

  return {
    ...raw,
    Document_ID: String(raw.Document_ID || raw.id || ''),
    CompanyID: String(raw.CompanyID || raw.companyId || 'COM-0001'),
    Document_Type_ID: String(raw.Document_Type_ID || raw.typeId || ''),
    Category_ID: String(raw.Category_ID || raw.categoryId || ''),
    Document_Name: String(raw.Document_Name || raw.name || ''),
    Issuing_Authority: String(raw.Issuing_Authority || raw.authority || ''),
    Primary_Number: String(raw.Primary_Number || raw.primaryNumber || ''),
    Secondary_Number: raw.Secondary_Number ? String(raw.Secondary_Number) : undefined,
    Issue_Date: raw.Issue_Date ? String(raw.Issue_Date).split('T')[0] : '',
    Expiry_Date: raw.Expiry_Date ? String(raw.Expiry_Date).split('T')[0] : '',
    Last_Renewal_Date: raw.Last_Renewal_Date ? String(raw.Last_Renewal_Date).split('T')[0] : '',
    Status: raw.Status || 'ACTIVE',
    Reminder_Days: Number(raw.Reminder_Days) || 60,
    Notes: raw.Notes || '',
    Attachment_File_ID: raw.Attachment_File_ID || '',
    Attachment_File_Name: raw.Attachment_File_Name || '',
    Attachment_URL: raw.Attachment_URL || '',
    Custom_Fields_JSON: typeof raw.Custom_Fields_JSON === 'string' ? raw.Custom_Fields_JSON : JSON.stringify(customData),
    Branch: raw.Branch || '',
    Is_Active: raw.Is_Active !== false && String(raw.Is_Active).toLowerCase() !== 'false',
    Is_Archived: Boolean(raw.Is_Archived && String(raw.Is_Archived).toLowerCase() !== 'false'),
    Is_Deleted: Boolean(raw.Is_Deleted && String(raw.Is_Deleted).toLowerCase() !== 'false'),
    customData,
  };
}

export const documentService = {
  /**
   * Fetch all document categories
   */
  getCategories: async (companyId: string = 'COM-0001'): Promise<ApiResponse<DocumentCategory[]>> => {
    try {
      const res = await ApiClient.post<DocumentCategory[]>('GET_DOCUMENT_CATEGORIES', { CompanyID: companyId });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_CATS_KEY, JSON.stringify(res.data));
        return res;
      }
    } catch {
      // Backend not reached or table empty, fallback to local/seed
    }

    const local = localStorage.getItem(LOCAL_STORAGE_CATS_KEY);
    const data = local ? JSON.parse(local) : INITIAL_DOCUMENT_CATEGORIES;
    return { success: true, data, message: 'Loaded from local cache', timestamp: new Date().toISOString() };
  },

  getDocumentCategories: async (companyId: string = 'COM-0001'): Promise<ApiResponse<DocumentCategory[]>> => {
    return documentService.getCategories(companyId);
  },

  /**
   * Fetch all configurable document types
   */
  getDocumentTypes: async (companyId: string = 'COM-0001'): Promise<ApiResponse<DocumentType[]>> => {
    try {
      const res = await ApiClient.post<DocumentType[]>('GET_DOCUMENT_TYPES', { CompanyID: companyId });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(LOCAL_STORAGE_TYPES_KEY, JSON.stringify(res.data));
        return res;
      }
    } catch {
      // Backend fallback
    }

    const local = localStorage.getItem(LOCAL_STORAGE_TYPES_KEY);
    const data = local ? JSON.parse(local) : INITIAL_DOCUMENT_TYPES;
    return { success: true, data, message: 'Loaded from local cache', timestamp: new Date().toISOString() };
  },

  /**
   * Save (create or update) a document type
   */
  saveDocumentType: async (docType: Partial<DocumentType>, companyId: string = 'COM-0001'): Promise<ApiResponse<DocumentType>> => {
    const payload = {
      ...docType,
      CompanyID: companyId,
      Type_ID: docType.Type_ID || `DT_${Date.now()}`,
      Status: docType.Status || 'ACTIVE',
      DefaultReminderDays: Number(docType.DefaultReminderDays) || 30,
      DisplayOrder: Number(docType.DisplayOrder) || 10,
    };

    try {
      const res = await ApiClient.post<DocumentType>('SAVE_DOCUMENT_TYPE', payload);
      if (res.success && res.data) {
        return res;
      }
    } catch (e) {
      console.warn('Backend saveDocumentType returned error, updating local cache', e);
    }

    // Update local cache
    const currentTypes = (await documentService.getDocumentTypes(companyId)).data || [];
    const index = currentTypes.findIndex(t => t.Type_ID === payload.Type_ID);
    let updatedTypes: DocumentType[];
    if (index >= 0) {
      updatedTypes = [...currentTypes];
      updatedTypes[index] = { ...updatedTypes[index], ...payload } as DocumentType;
    } else {
      updatedTypes = [...currentTypes, payload as DocumentType];
    }
    localStorage.setItem(LOCAL_STORAGE_TYPES_KEY, JSON.stringify(updatedTypes));

    return { success: true, data: payload as DocumentType, message: 'تم حفظ نوع الوثيقة بنجاح', timestamp: new Date().toISOString() };
  },

  /**
   * Fetch company documents
   */
  getCompanyDocuments: async (companyId: string = 'COM-0001', includeArchived: boolean = false): Promise<ApiResponse<CompanyDocument[]>> => {
    try {
      const res = await ApiClient.post<any[]>('GET_COMPANY_DOCUMENTS', { 
        CompanyID: companyId,
        includeArchived 
      });

      if (res.success && Array.isArray(res.data)) {
        const normalized = res.data
          .filter(d => !d.Is_Deleted || String(d.Is_Deleted).toLowerCase() === 'false')
          .map(normalizeDocument);
        localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(normalized));
        return { success: true, data: normalized, message: res.message, timestamp: res.timestamp || new Date().toISOString() };
      }
    } catch {
      // Backend fallback
    }

    const local = localStorage.getItem(LOCAL_STORAGE_DOCS_KEY);
    let list: CompanyDocument[] = local ? JSON.parse(local) : INITIAL_COMPANY_DOCUMENTS;
    list = list.map(normalizeDocument);
    if (!includeArchived) {
      list = list.filter(d => !d.Is_Archived);
    }
    return { success: true, data: list, message: 'Loaded from local state', timestamp: new Date().toISOString() };
  },

  /**
   * Create a new company document
   */
  createCompanyDocument: async (doc: Partial<CompanyDocument>, companyId: string = 'COM-0001'): Promise<ApiResponse<CompanyDocument>> => {
    const newDocId = `DOC_${Date.now()}`;
    const payload: Partial<CompanyDocument> = {
      ...doc,
      Document_ID: newDocId,
      CompanyID: companyId,
      Status: doc.Status || 'ACTIVE',
      Is_Active: true,
      Is_Archived: false,
      Is_Deleted: false,
      Reminder_Days: Number(doc.Reminder_Days) || 60,
      Created_At: new Date().toISOString(),
      Updated_At: new Date().toISOString(),
    };

    const res = await ApiClient.post<CompanyDocument>('CREATE_COMPANY_DOCUMENT', payload);
    
    // Always keep local cache synchronized on confirmed response
    if (res.success) {
      const created = normalizeDocument(res.data || payload);
      const current = (await documentService.getCompanyDocuments(companyId, true)).data || [];
      const updated = [created, ...current.filter(d => d.Document_ID !== created.Document_ID)];
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(updated));
      return { success: true, data: created, message: 'تم حفظ الوثيقة بنجاح', timestamp: new Date().toISOString() };
    }

    throw new Error(res.error?.details || res.message || 'فشل حفظ الوثيقة');
  },

  /**
   * Update an existing company document
   */
  updateCompanyDocument: async (documentId: string, updates: Partial<CompanyDocument>, companyId: string = 'COM-0001'): Promise<ApiResponse<CompanyDocument>> => {
    const payload = {
      ...updates,
      Document_ID: documentId,
      CompanyID: companyId,
      Updated_At: new Date().toISOString(),
    };

    const res = await ApiClient.post<CompanyDocument>('UPDATE_COMPANY_DOCUMENT', payload);
    
    if (res.success) {
      const current = (await documentService.getCompanyDocuments(companyId, true)).data || [];
      const index = current.findIndex(d => d.Document_ID === documentId);
      if (index >= 0) {
        const merged = normalizeDocument({ ...current[index], ...payload, ...(res.data || {}) });
        current[index] = merged;
        localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(current));
        return { success: true, data: merged, message: 'تم تحديث بيانات الوثيقة بنجاح', timestamp: new Date().toISOString() };
      }
      return { ...res, timestamp: res.timestamp || new Date().toISOString() };
    }

    throw new Error(res.error?.details || res.message || 'فشل تحديث الوثيقة');
  },

  /**
   * Renew document (records previous expiry in renewal history)
   */
  renewDocument: async (
    documentId: string,
    renewalData: {
      newExpiryDate: string;
      renewalDate: string;
      notes?: string;
      attachmentUrl?: string;
      attachmentFileName?: string;
    },
    companyId: string = 'COM-0001'
  ): Promise<ApiResponse<CompanyDocument>> => {
    const docs = (await documentService.getCompanyDocuments(companyId, true)).data || [];
    const targetDoc = docs.find(d => d.Document_ID === documentId);
    if (!targetDoc) throw new Error('الوثيقة غير موجودة');

    const previousExpiry = targetDoc.Expiry_Date || '';
    const payload = {
      Document_ID: documentId,
      CompanyID: companyId,
      Previous_Expiry_Date: previousExpiry,
      Renewal_Date: renewalData.renewalDate || new Date().toISOString().split('T')[0],
      New_Expiry_Date: renewalData.newExpiryDate,
      Notes: renewalData.notes || 'تجديد دوري',
      Attachment_URL: renewalData.attachmentUrl || targetDoc.Attachment_URL || '',
      Attachment_File_Name: renewalData.attachmentFileName || targetDoc.Attachment_File_Name || '',
    };

    const res = await ApiClient.post<CompanyDocument>('RENEW_COMPANY_DOCUMENT', payload);

    if (res.success) {
      const updatedDoc = normalizeDocument({
        ...targetDoc,
        Expiry_Date: renewalData.newExpiryDate,
        Last_Renewal_Date: renewalData.renewalDate,
        Attachment_URL: payload.Attachment_URL,
        Attachment_File_Name: payload.Attachment_File_Name,
        Status: 'ACTIVE',
        Updated_At: new Date().toISOString(),
      });

      const updatedList = docs.map(d => d.Document_ID === documentId ? updatedDoc : d);
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(updatedList));

      // Append to local renewal history
      const localRenewalsStr = localStorage.getItem(LOCAL_STORAGE_RENEWAL_KEY);
      const localRenewals: DocumentRenewalRecord[] = localRenewalsStr ? JSON.parse(localRenewalsStr) : [];
      localRenewals.unshift({
        Renewal_ID: `REN_${Date.now()}`,
        CompanyID: companyId,
        Document_ID: documentId,
        Previous_Expiry_Date: previousExpiry,
        Renewal_Date: renewalData.renewalDate,
        New_Expiry_Date: renewalData.newExpiryDate,
        Notes: renewalData.notes,
        Attachment_URL: payload.Attachment_URL,
        Attachment_File_Name: payload.Attachment_File_Name,
        CreatedAt: new Date().toISOString(),
      });
      localStorage.setItem(LOCAL_STORAGE_RENEWAL_KEY, JSON.stringify(localRenewals));

      return { success: true, data: updatedDoc, message: 'تم تجديد الوثيقة وتسجيل العملية في الأرشيف بنجاح', timestamp: new Date().toISOString() };
    }

    throw new Error(res.error?.details || res.message || 'فشل تجديد الوثيقة');
  },

  /**
   * Toggle archive status
   */
  archiveDocument: async (documentId: string, isArchived: boolean = true, companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    const res = await ApiClient.post<boolean>('ARCHIVE_COMPANY_DOCUMENT', {
      Document_ID: documentId,
      CompanyID: companyId,
      Is_Archived: isArchived,
    });

    if (res.success) {
      const docs = (await documentService.getCompanyDocuments(companyId, true)).data || [];
      const updated = docs.map(d => d.Document_ID === documentId ? { ...d, Is_Archived: isArchived } : d);
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(updated));
      return { success: true, data: true, message: isArchived ? 'تم نقل الوثيقة إلى الأرشيف' : 'تم استعادة الوثيقة من الأرشيف', timestamp: new Date().toISOString() };
    }

    throw new Error(res.error?.details || res.message || 'فشل أرشفة الوثيقة');
  },

  archiveCompanyDocument: async (documentId: string, isArchived: boolean = true, companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    return documentService.archiveDocument(documentId, isArchived, companyId);
  },

  /**
   * Delete document (soft delete)
   */
  deleteDocument: async (documentId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    const res = await ApiClient.post<boolean>('DELETE_COMPANY_DOCUMENT', {
      Document_ID: documentId,
      CompanyID: companyId,
    });

    if (res.success) {
      const docs = (await documentService.getCompanyDocuments(companyId, true)).data || [];
      const updated = docs.filter(d => d.Document_ID !== documentId);
      localStorage.setItem(LOCAL_STORAGE_DOCS_KEY, JSON.stringify(updated));
      return { success: true, data: true, message: 'تم حذف الوثيقة بنجاح', timestamp: new Date().toISOString() };
    }

    throw new Error(res.error?.details || res.message || 'فشل حذف الوثيقة');
  },

  deleteCompanyDocument: async (documentId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    return documentService.deleteDocument(documentId, companyId);
  },

  /**
   * Upload Document Attachment to Google Drive
   */
  uploadDocumentFile: async (payload: {
    fileName: string;
    mimeType: string;
    base64Data: string;
    documentType?: string;
    category?: string;
    companyId?: string;
  }): Promise<ApiResponse<{ fileId: string; fileUrl: string; fileName: string }>> => {
    try {
      const res = await ApiClient.post<{ fileId: string; fileUrl: string; fileName: string }>('UPLOAD_DOCUMENT_FILE', payload);
      if (res.success && res.data?.fileUrl) {
        return { ...res, timestamp: res.timestamp || new Date().toISOString() };
      }
    } catch {
      // If Drive upload fails, create a safe data blob URL for preview
    }

    // Safe base64 fallback for local/offline usage
    const dataUrl = `data:${payload.mimeType || 'application/pdf'};base64,${payload.base64Data}`;
    return {
      success: true,
      data: {
        fileId: `file_${Date.now()}`,
        fileUrl: dataUrl,
        fileName: payload.fileName,
      },
      message: 'تم حفظ الملف بنجاح',
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Calculate KPIs and Expiry Summary
   */
  calculateKPIs: (documents: CompanyDocument[], documentTypes: DocumentType[] = []): DocumentKPIs => {
    const typeMap = new Map<string, DocumentType>();
    documentTypes.forEach(t => typeMap.set(t.Type_ID, t));

    let safeCount = 0;
    let attentionCount = 0;
    let warningCount = 0;
    let criticalCount = 0;
    let expiredCount = 0;
    let noExpiryCount = 0;
    let archivedCount = 0;

    let nearestExpiringDoc: DocumentKPIs['nearestExpiringDoc'] = null;
    let minDays = Infinity;

    documents.forEach(doc => {
      if (doc.Is_Archived) {
        archivedCount++;
        return;
      }

      const docType = typeMap.get(doc.Document_Type_ID);
      const hasExp = docType ? docType.HasExpiry : Boolean(doc.Expiry_Date);
      const reminderDays = doc.Reminder_Days || docType?.DefaultReminderDays || 60;

      const exp = calculateDocumentExpiry(doc.Expiry_Date, hasExp, reminderDays, doc.Issue_Date);

      switch (exp.status) {
        case 'SAFE':
          safeCount++;
          break;
        case 'ATTENTION':
          attentionCount++;
          break;
        case 'WARNING':
          warningCount++;
          break;
        case 'CRITICAL':
          criticalCount++;
          break;
        case 'EXPIRED':
          expiredCount++;
          break;
        case 'NO_EXPIRY':
        case 'NOT_SET':
          noExpiryCount++;
          break;
      }

      if (hasExp && doc.Expiry_Date && exp.daysRemaining >= 0 && exp.daysRemaining < minDays) {
        minDays = exp.daysRemaining;
        nearestExpiringDoc = {
          id: doc.Document_ID,
          name: doc.Document_Name,
          type: docType?.TypeNameAR || 'وثيقة رسمية',
          daysRemaining: exp.daysRemaining,
          expiryDate: doc.Expiry_Date,
        };
      }
    });

    return {
      totalDocuments: documents.filter(d => !d.Is_Archived).length,
      safeCount,
      attentionCount,
      warningCount,
      criticalCount,
      expiredCount,
      noExpiryCount,
      archivedCount,
      nearestExpiringDoc,
    };
  },
};
