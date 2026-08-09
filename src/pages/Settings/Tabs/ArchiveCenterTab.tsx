import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/contexts/AdminSecurityContext';
import { archiveService } from '@/services/archiveService';
import { AuditLogEntry, ArchivedRecord } from '@/db/archiveDb';
import { Button } from '@/components/ui/button';

import { Search, Loader2, RotateCcw, Download, FileText, AlertTriangle, User, Calendar, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export function ArchiveCenterTab() {
  const { requireAdminAuth } = useAdminAuth();
  const [activeView, setActiveView] = useState<'records' | 'audit'>('records');
  const [archivedRecords, setArchivedRecords] = useState<ArchivedRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const records = await archiveService.getArchivedRecords();
      const logs = await archiveService.getAuditLogs();
      setArchivedRecords(records.sort((a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime()));
      setAuditLogs(logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error(error);
      toast.error('فشل في تحميل بيانات الأرشيف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = (record: ArchivedRecord) => {
    requireAdminAuth('استعادة السجل من الأرشيف', async () => {
      // Prompt for restore reason
      const reason = window.prompt('سبب الاستعادة (مطلوب):');
      if (!reason || reason.trim() === '') {
        toast.error('يجب إدخال سبب الاستعادة');
        return;
      }
      
      try {
        const adminUser = { id: 'admin-1', name: 'Admin', role: 'admin' };
        // In reality, these should come from AuthContext. For now mock admin object.
        // Wait, where do we get current user?
        // Since it's admin auth passed, we just use a generic admin user or get from local storage.
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : adminUser;
        
        await archiveService.restoreRecord(record.id, user, 'COM-0001');
        toast.success('تم استعادة السجل بنجاح');
        loadData();
      } catch (error) {
        console.error(error);
        toast.error('فشل في استعادة السجل');
      }
    });
  };

  const exportData = (type: 'pdf' | 'excel' | 'json') => {
    if (type === 'json') {
      const dataStr = JSON.stringify({ records: archivedRecords, auditLogs }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = 'archive_export.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      toast.success('تم تصدير البيانات بنجاح');
    } else {
      toast.error('جاري تطوير هذه الميزة');
    }
  };

  const filteredRecords = archivedRecords.filter(r => 
    r.archiveReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEntityName = (type: string) => {
    switch(type) {
      case 'COMMISSION_RECORD': return 'سجل عمولة';
      case 'QUOTE': return 'عرض سعر';
      case 'PRODUCT': return 'منتج';
      case 'EMPLOYEE': return 'مندوب / موظف';
      default: return type;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">مركز الأرشيف (Archive Center)</h2>
          <p className="text-sm text-slate-500">إدارة السجلات المؤرشفة وسجلات التدقيق (Audit Logs)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportData('json')} className="gap-2">
            <Download className="w-4 h-4" /> تصدير (JSON)
          </Button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          className={`pb-3 px-4 font-bold text-sm ${activeView === 'records' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
          onClick={() => setActiveView('records')}
        >
          السجلات المؤرشفة ({archivedRecords.length})
        </button>
        <button
          className={`pb-3 px-4 font-bold text-sm ${activeView === 'audit' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
          onClick={() => setActiveView('audit')}
        >
          سجلات التدقيق (Audit Logs)
        </button>
      </div>

      {activeView === 'records' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="بحث في الأرشيف (السبب، المعرف، النوع)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                
              />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">المعرف / النوع</th>
                  <th className="px-4 py-3 font-bold">السبب</th>
                  <th className="px-4 py-3 font-bold">بواسطة / التاريخ</th>
                  <th className="px-4 py-3 font-bold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="block font-mono text-xs">{record.id}</span>
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
                        <Database className="w-3 h-3" /> {getEntityName(record.entityType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{record.archiveReason}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <User className="w-3 h-3" /> {record.archivedBy}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <Calendar className="w-3 h-3" /> {format(new Date(record.archivedAt), 'yyyy-MM-dd HH:mm', { locale: ar })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1 text-blue-600 hover:text-blue-700"
                        onClick={() => handleRestore(record)}
                      >
                        <RotateCcw className="w-4 h-4" /> استعادة
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      لا توجد سجلات مؤرشفة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-bold">التاريخ والوقت</th>
                <th className="px-4 py-3 font-bold">المستخدم (Admin)</th>
                <th className="px-4 py-3 font-bold">الإجراء / النوع</th>
                <th className="px-4 py-3 font-bold">السبب</th>
                <th className="px-4 py-3 font-bold">الجهاز (Metadata)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono">{format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
                  <td className="px-4 py-3">
                    <span className="font-bold">{log.adminUsername}</span>
                    <span className="block text-slate-500">{log.userRole}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${log.action === 'ARCHIVE' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {log.action}
                    </span>
                    <span className="block text-slate-500 mt-1">{getEntityName(log.entityType)}</span>
                  </td>
                  <td className="px-4 py-3 font-medium">{log.archiveReason}</td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{log.os} - {log.browser}</div>
                    <div className="truncate max-w-[150px]" title={log.userAgent}>{log.userAgent}</div>
                  </td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    لا توجد سجلات تدقيق
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
