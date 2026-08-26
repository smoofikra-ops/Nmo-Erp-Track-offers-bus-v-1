import React, { useState, useEffect } from 'react';
import { BusServiceLog } from '@/types/busOperations';
import { Vehicle } from '@/types/fleet';
import { busOperationsService } from '@/services/busOperationsService';
import { 
  Wrench, Fuel, Disc, Calendar, ExternalLink, 
  Trash2, Search, Filter, RefreshCw, FileText, 
  User, Gauge, DollarSign, Download, Eye, AlertCircle, CheckCircle2 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BusServiceLogsListProps {
  vehicleId?: string;
  companyId?: string;
  vehicles?: Vehicle[];
  onRefreshNeeded?: () => void;
}

export function BusServiceLogsList({
  vehicleId,
  companyId = 'COM-0001',
  vehicles = [],
  onRefreshNeeded,
}: BusServiceLogsListProps) {
  const [logs, setLogs] = useState<BusServiceLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState(vehicleId || 'ALL');

  useEffect(() => {
    loadLogs();
  }, [vehicleId, companyId]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await busOperationsService.getServiceLogs({
        vehicleId: vehicleId || undefined,
        companyId,
      });
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (e) {
      console.error('Failed to load bus logs', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    try {
      const res = await busOperationsService.deleteServiceLog(logId, companyId);
      if (res.success) {
        toast.success('تم حذف السجل بنجاح');
        setLogs(prev => prev.filter(l => l.Service_Log_ID !== logId));
        onRefreshNeeded?.();
      }
    } catch (e) {
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      log.Service_Name.toLowerCase().includes(term) ||
      (log.Category_Name && log.Category_Name.toLowerCase().includes(term)) ||
      (log.Employee_Name && log.Employee_Name.toLowerCase().includes(term)) ||
      (log.Workshop && log.Workshop.toLowerCase().includes(term)) ||
      (log.Invoice_No && log.Invoice_No.toLowerCase().includes(term)) ||
      (log.Notes && log.Notes.toLowerCase().includes(term))
    );

    const matchesCat = categoryFilter === 'ALL' || log.Category_ID === categoryFilter;
    const matchesVeh = selectedVehicleFilter === 'ALL' || log.Vehicle_ID === selectedVehicleFilter;

    return matchesSearch && matchesCat && matchesVeh;
  });

  const totalSpent = filteredLogs.reduce((acc, l) => acc + (Number(l.Total_Cost) || 0), 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              سجل عمليات وصيانة الباصات
            </h3>
            <span className="text-[11px] text-slate-400">
              إجمالي المصروفات: <strong className="font-mono text-emerald-600">{totalSpent.toLocaleString()} ر.س</strong> ({filteredLogs.length} سجل)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالعملية، السائق، الفاتورة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-8 pl-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
            />
          </div>

          {!vehicleId && vehicles.length > 0 && (
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="ALL">كافة الباصات</option>
              {vehicles.map(v => (
                <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                  {v.Plate_Number} ({v.Brand})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={loadLogs}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600"
            title="تحديث"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table / Cards */}
      {isLoading ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">جاري تحميل سجلات الباصات...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">لا توجد عمليات مسجلة حتى الآن</p>
          <p className="text-[11px] text-slate-400">استخدم زر "الإدخال السريع" لتسجيل وقود أو صيانة أو تبديل إطارات.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredLogs.map((log) => {
            const dynamic = log.dynamicFields || (log.Dynamic_Fields_JSON ? (typeof log.Dynamic_Fields_JSON === 'string' ? JSON.parse(log.Dynamic_Fields_JSON) : log.Dynamic_Fields_JSON) : null);
            return (
              <div
                key={log.Service_Log_ID}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs"
              >
                {/* Left Block: Basic Details & Tags */}
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Wrench className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">
                        {log.Service_Name}
                      </h4>
                      {log.Category_Name && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {log.Category_Name}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {log.Operation_Date}
                      </span>
                    </div>

                    {/* Sub metadata */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      {log.Employee_Name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.Employee_Name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-mono font-bold">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        {Number(log.Odometer).toLocaleString()} كم
                      </span>
                      {log.Workshop && (
                        <span>المركز: {log.Workshop}</span>
                      )}
                      {log.Invoice_No && (
                        <span className="font-mono">فاتورة #{log.Invoice_No}</span>
                      )}
                    </div>

                    {/* Dynamic badges (Tire position, Oil brand, etc.) */}
                    {dynamic && (
                      <div className="flex items-center gap-2 text-[10px] pt-1 flex-wrap">
                        {dynamic.oilBrand && (
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-medium">
                            الزيت: {dynamic.oilBrand}
                          </span>
                        )}
                        {dynamic.tirePosition && (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium">
                            الموقع: {dynamic.tirePosition} ({dynamic.tireBrand || ''})
                          </span>
                        )}
                        {dynamic.fuelType && (
                          <span className="px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-medium">
                            وقود: {dynamic.fuelType} ({dynamic.gasStation || ''})
                          </span>
                        )}
                      </div>
                    )}

                    {log.Notes && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 italic pt-0.5">
                        "{log.Notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Block: Cost & Drive Invoice Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] text-slate-400 block">المبلغ الإجمالي</span>
                    <span className="text-sm font-black font-mono text-emerald-600">
                      {Number(log.Total_Cost || 0).toLocaleString()} ر.س
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Drive Invoice Button */}
                    {log.Invoice_Drive_URL ? (
                      <a
                        href={log.Invoice_Drive_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1 transition-colors"
                        title="عرض الفاتورة المؤرشفة في Google Drive"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        الفاتورة
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        بدون فاتورة
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(log.Service_Log_ID)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="حذف السجل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
