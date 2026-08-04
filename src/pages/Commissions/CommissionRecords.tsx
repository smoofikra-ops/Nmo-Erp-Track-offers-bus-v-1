import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';


import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useAdminAuth } from '@/contexts/AdminSecurityContext';
import { hasPermission, RolePermissions } from '@/utils/permissions';
import { CommissionRecord } from '@/types/commissions';
import { commissionService } from '@/services/commissionService';
import { PrintableCommissionSummary } from '@/components/commissions/PrintableCommissionSummary';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { ArrowLeft, Search, TrendingUp, CreditCard, Package, Filter, Eye, Printer, Trash2, Calendar, Lock, Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export function CommissionRecords() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { requireAdminAuth } = useAdminAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showMetrics, setShowMetrics] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('');
  
  const [viewRecordModal, setViewRecordModal] = useState<CommissionRecord | null>(null);
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<CommissionRecord | null>(null);
  const [financialAccessGranted, setFinancialAccessGranted] = useState(false);
  
  const canViewFinancials = user ? (hasPermission(user.role, RolePermissions.CAN_VIEW_FINANCIAL_SUMMARY) || financialAccessGranted) : false;

  const { data: allRecords = [] as CommissionRecord[], isLoading: recordsLoading } = useQuery<CommissionRecord[]>({
    queryKey: ['commissionRecords'],
    queryFn: async () => {
      const response = await commissionService.getCommissionRecords('COM-0001');
      return (response.data || []) as CommissionRecord[];
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (recordId: string) => {
      await commissionService.deleteCommissionRecord(recordId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRecords'] });
      toast.success('تم حذف السجل بنجاح');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء حذف السجل');
    }
  });

  const handleDelete = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('حذف سجل عمولة نهائياً', () => {
      if (window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
        deleteRecordMutation.mutate(recordId);
      }
    });
  };

  const filteredRecords = useMemo(() => {
    return allRecords.filter(rec => {
      if (user?.role === 'SALES_REPRESENTATIVE' && rec.employeeId !== user.id && rec.employeeName !== user.name && rec.employeeCode !== user.id) return false;
      
      const q = searchTerm.toLowerCase();
      if (q) {
        const matchTrx = rec.transactionNo?.toLowerCase().includes(q);
        const matchName = rec.employeeName?.toLowerCase().includes(q);
        const matchCode = rec.employeeCode?.toLowerCase().includes(q);
        if (!matchTrx && !matchName && !matchCode) return false;
      }
      if (selectedEmployeeFilter && rec.employeeId !== selectedEmployeeFilter) return false;
      if (selectedTypeFilter && rec.commissionType !== selectedTypeFilter) return false;
      if (dateFilter) {
        if (!rec.formattedDate?.startsWith(dateFilter) && !rec.createdAt?.startsWith(dateFilter)) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allRecords, searchTerm, selectedEmployeeFilter, selectedTypeFilter, dateFilter, user]);

  const totalNetCommissions = filteredRecords.reduce((sum, r) => sum + (r.netCommission || 0), 0);
  const totalCodCollected = filteredRecords.reduce((sum, r) => sum + (r.codRequiredAmount || 0), 0);
  const totalItemsCount = filteredRecords.reduce((sum, r) => sum + (r.quantityOrOrdersCount || 0), 0);

  const uniqueEmployees = Array.from(new Set(allRecords.map(r => JSON.stringify({ id: r.employeeId, name: r.employeeName, code: r.employeeCode })))).map(s => JSON.parse(s as string));

  const groupedRecords: { [key: string]: CommissionRecord[] } = {};
  filteredRecords.forEach(rec => {
    let dateStr = 'تاريخ غير معروف';
    if (rec.createdAt) {
      const d = new Date(rec.createdAt);
      if (!isNaN(d.getTime())) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = d.toDateString() === today.toDateString();
        const isYesterday = d.toDateString() === yesterday.toDateString();
        if (isToday) dateStr = 'اليوم';
        else if (isYesterday) dateStr = 'أمس';
        else dateStr = new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
      }
    }
    if (!groupedRecords[dateStr]) groupedRecords[dateStr] = [];
    groupedRecords[dateStr].push(rec);
  });

  if (recordsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/commission')}>
            <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <FileText className="h-6 w-6 text-emerald-600" />
              <span>سجل العمولات الدائم (Commission Records)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              أرشيف كامل لجميع عمليات احتساب العمولات.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => navigate('/commission/products')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 flex-1 sm:flex-none">
            <Plus className="h-4 w-4" />
            <span>احتساب عمولة منتجات</span>
          </Button>
          <Button onClick={() => navigate('/commission/order-count')} variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>عمولة عدد الطلبات</span>
          </Button>
        </div>
      </div>

      {!canViewFinancials && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => requireAdminAuth('كشف البيانات المالية', () => setFinancialAccessGranted(true))}
            className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 gap-2 w-full sm:w-auto"
            variant="outline"
          >
            <Lock className="h-4 w-4" />
            <span>كشف البيانات المالية (يتطلب صلاحية الإدارة)</span>
          </Button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800 block">إجمالي العمولات المستحقة</span>
              <span className="text-xl font-black text-emerald-700">{totalNetCommissions.toFixed(2)} ر.س</span>
            </div>
          </CardContent>
        </Card>
        
        {canViewFinancials && (
          <Card className="bg-blue-50/50 border-blue-200/80 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-blue-800 block">الدفع عند الاستلام (COD)</span>
                <span className="text-xl font-black text-blue-700">{totalCodCollected.toFixed(2)} ر.س</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-700 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">إجمالي الحركات والقطع</span>
              <span className="text-xl font-black text-slate-900">
                {filteredRecords.length} عملية <span className="text-xs font-normal text-slate-500">({totalItemsCount} قطعة)</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="البحث برقم العملية، المندوب..." className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 pl-3 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              >
                <option value="">جميع المناديب</option>
                {uniqueEmployees.map((e: any, i) => (
                  <option key={i} value={e.id}>{e.name} ({e.code})</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="">جميع أنواع العمولات</option>
                <option value="PRODUCT_COMMISSION">عمولة منتجات (بالقطعة)</option>
                <option value="ORDER_COUNT_COMMISSION">عمولة طلبات (بالعدد)</option>
              </select>
            </div>
            <div className="relative">
              <input
                type="date"
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-right whitespace-nowrap hidden md:table">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">رقم العملية</th>
                <th className="px-4 py-3.5">التاريخ والوقت</th>
                <th className="px-4 py-3.5">اسم المندوب</th>
                <th className="px-4 py-3.5">نوع العمولة</th>
                <th className="px-4 py-3.5 text-center">عدد القطع / الطلبات</th>
                {canViewFinancials && <th className="px-4 py-3.5 text-left">إجمالي العمولة</th>}
                {canViewFinancials && <th className="px-4 py-3.5 text-left">الخصم</th>}
                {canViewFinancials && <th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>}
                {canViewFinancials && <th className="px-4 py-3.5 text-left">الدفع عند الاستلام (COD)</th>}
                <th className="px-4 py-3.5 text-left">صافي العمولة</th>
                <th className="px-4 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(groupedRecords).length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-500">
                    لا توجد سجلات مطابقة للبحث
                  </td>
                </tr>
              ) : (
                Object.entries(groupedRecords).map(([dateStr, records]) => (
                  <React.Fragment key={dateStr}>
                    <tr className="bg-slate-50/80">
                      <td colSpan={11} className="px-4 py-2 font-bold text-slate-800 text-[11px] border-y border-slate-200">
                        {dateStr}
                      </td>
                    </tr>
                    {records.map(r => (
                      <tr key={r.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer" onClick={() => setViewRecordModal(r)}>
                        <td className="px-4 py-3 font-mono font-medium text-emerald-700">{r.transactionNo}</td>
                        <td className="px-4 py-3 text-slate-600">{r.formattedDate}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{r.employeeName}</span>
                          <span className="block text-[10px] text-slate-400">{r.employeeCode}</span>
                        </td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">
                          {r.commissionType === 'PRODUCT_COMMISSION' ? 'منتجات' : 'طلبات'}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold">{r.quantityOrOrdersCount}</td>
                        
                        {canViewFinancials && (
                          <td className="px-4 py-3 text-left font-medium">{r.grossCommission?.toFixed(2)} ر.س</td>
                        )}
                        {canViewFinancials && (
                          <td className="px-4 py-3 text-left font-bold text-red-600">
                            {r.totalDiscount > 0 ? `-${r.totalDiscount.toFixed(2)} ر.س` : '-'}
                          </td>
                        )}
                        {canViewFinancials && (
                          <td className="px-4 py-3 text-left font-medium text-blue-700">{r.onlinePaidAmount?.toFixed(2) || '0.00'} ر.س</td>
                        )}
                        {canViewFinancials && (
                          <td className="px-4 py-3 text-left font-bold text-amber-700">{r.codRequiredAmount?.toFixed(2) || '0.00'} ر.س</td>
                        )}
                        
                        <td className="px-4 py-3 text-left font-black text-emerald-700 text-sm">{r.netCommission?.toFixed(2)} ر.س</td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-emerald-700" onClick={() => setViewRecordModal(r)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => setSelectedRecordForPrint(r)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                            {canViewFinancials && (
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={(e) => handleDelete(r.id, e)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {Object.keys(groupedRecords).length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد سجلات</div>
            ) : (
              Object.entries(groupedRecords).map(([dateStr, records]) => (
                <React.Fragment key={dateStr}>
                  <div className="bg-slate-50/80 px-4 py-2 font-bold text-slate-800 text-[11px] border-y border-slate-200">
                    {dateStr}
                  </div>
                  {records.map(r => (
                    <div key={r.id} className="p-4 space-y-3" onClick={() => setViewRecordModal(r)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-emerald-700">{r.transactionNo}</span>
                          <span className="block text-slate-500 text-[10px] mt-0.5">{r.formattedDate}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block">{r.employeeName}</span>
                          <span className="text-[10px] text-slate-400 block">{r.employeeCode}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-600">نوع العمولة</span>
                        <span className="font-bold text-emerald-700">{r.commissionType === 'PRODUCT_COMMISSION' ? 'منتجات' : 'طلبات'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-600">الكمية/الطلبات</span>
                        <span className="font-mono font-bold">{r.quantityOrOrdersCount}</span>
                      </div>
                      
                      {canViewFinancials && (
                        <>
                          <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg border-b border-slate-200">
                            <span className="text-slate-600">إجمالي العمولة</span>
                            <span className="font-bold">{r.grossCommission?.toFixed(2)} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg border-b border-slate-200">
                            <span className="text-slate-600">المطلوب (COD)</span>
                            <span className="font-bold text-amber-700">{r.codRequiredAmount?.toFixed(2) || '0.00'} ر.س</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center text-sm p-2 bg-emerald-50 rounded-lg">
                        <span className="text-emerald-900 font-bold">صافي العمولة</span>
                        <span className="font-black text-emerald-700">{r.netCommission?.toFixed(2)} ر.س</span>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button variant="outline" size="sm" className="h-8 text-slate-600 w-full" onClick={(e) => { e.stopPropagation(); setViewRecordModal(r); }}>
                          <Eye className="h-4 w-4 ml-2" /> التفاصيل
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-emerald-600 w-full" onClick={(e) => { e.stopPropagation(); setSelectedRecordForPrint(r); }}>
                          <Printer className="h-4 w-4 ml-2" /> طباعة
                        </Button>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
  
        </CardContent>
      </Card>

      {/* Record Details Modal */}
      {viewRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">تفاصيل العملية #{viewRecordModal.transactionNo}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{viewRecordModal.formattedDate}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setViewRecordModal(null)}>
                إغلاق
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">اسم المندوب:</span>
                <span className="font-bold text-slate-900">{viewRecordModal.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">كود المندوب:</span>
                <span className="font-mono text-slate-800">{viewRecordModal.employeeCode}</span>
              </div>
              <div>
                <span className="text-slate-500 block">نوع العمولة:</span>
                <span className="font-bold text-emerald-700">{viewRecordModal.commissionType === 'PRODUCT_COMMISSION' ? 'منتجات' : 'طلبات'}</span>
              </div>
            </div>

            {canViewFinancials && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700">الملخص المالي التفصيلي:</h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>إجمالي قيمة الطلب:</span>
                    <span className="font-bold">{(viewRecordModal.totalRequiredAmount || viewRecordModal.totalOrderValue || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>المبلغ المدفوع أونلاين:</span>
                    <span className="font-bold text-blue-700">{(viewRecordModal.onlinePaidAmount || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>الدفع عند الاستلام (COD):</span>
                    <span className="font-bold text-amber-700">{viewRecordModal.codRequiredAmount?.toFixed(2) || '0.00'} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 border-b">
                    <span>إجمالي العمولة قبل الخصم:</span>
                    <span className="font-bold">{(viewRecordModal.grossCommission || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                    <span>قيمة الخصومات المقتطعة:</span>
                    <span className="font-bold text-red-600">-{(viewRecordModal.totalDiscounts || viewRecordModal.totalDiscount || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between p-3 bg-emerald-50 text-emerald-950 font-bold text-sm">
                    <span>صافي العمولة المستحقة:</span>
                    <span className="font-black text-emerald-700 text-base">
                      {viewRecordModal.netCommission?.toFixed(2) || '0.00'} ر.س
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                onClick={() => {
                  const rec = viewRecordModal;
                  setViewRecordModal(null);
                  setSelectedRecordForPrint(rec);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>طباعة الملخص الرسمية (Print Summary)</span>
              </Button>
              <Button variant="outline" onClick={() => setViewRecordModal(null)}>
                إغلاق
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Summary Modal */}
      {selectedRecordForPrint && (
        <PrintableCommissionSummary
          record={selectedRecordForPrint}
          onClose={() => setSelectedRecordForPrint(null)}
          autoPrint={false}
        />
      )}
    </div>
  );
}
