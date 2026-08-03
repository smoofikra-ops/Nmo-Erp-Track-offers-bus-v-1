import { useAdminAuth } from '@/contexts/AdminSecurityContext';
import { useAuth } from "@/contexts/AuthContext";
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { commissionService } from '@/services/commissionService';
import { employeeService } from '@/services/employeeService';
import { PrintableCommissionSummary } from '@/components/commissions/PrintableCommissionSummary';
import { CommissionRecord } from '@/types/commissions';
import {
  Search,
  Printer,
  FileText,
  Filter,
  Calendar,
  User,
  Package,
  ArrowLeft,
  Trash2,
  Eye,
  Plus,
  TrendingUp,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export function CommissionRecords() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { requireAdminAuth } = useAdminAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  // Modal / Print states
  const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<CommissionRecord | null>(null);
  const [viewRecordModal, setViewRecordModal] = useState<CommissionRecord | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch Records
  const { data: recordsRes, isLoading: recordsLoading } = useQuery({
    queryKey: ['commissionRecords', companyId],
    queryFn: () => commissionService.getCommissionRecords(companyId),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  // Fetch Employees for filter
  const { data: empRes } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 30000,
  });

  const employees = (empRes?.data || []).filter((e) => e.Status === 'ACTIVE');
  const allRecords: CommissionRecord[] = recordsRes?.data || [];

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => commissionService.deleteCommissionRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commissionRecords'] });
    },
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('حذف سجل عمولة', () => {
      if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذه الخطوة.')) {
        deleteMutation.mutate(id);
      }
    });
  };

  // Filter Logic
  const filteredRecords = allRecords.filter((rec) => {
    // 1. Search by Transaction ID or Employee Name
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTrx = rec.transactionNo?.toLowerCase().includes(q);
      const matchName = rec.employeeName?.toLowerCase().includes(q);
      const matchCode = rec.employeeCode?.toLowerCase().includes(q);
      if (!matchTrx && !matchName && !matchCode) return false;
    }

    // 2. Filter by Employee
    if (selectedEmployeeFilter && rec.employeeId !== selectedEmployeeFilter) {
      return false;
    }

    // 3. Filter by Type
    if (selectedTypeFilter && rec.commissionType !== selectedTypeFilter) {
      return false;
    }

    // 4. Filter by Date (YYYY-MM-DD match)
    if (dateFilter) {
      if (!rec.formattedDate?.startsWith(dateFilter) && !rec.createdAt?.startsWith(dateFilter)) {
        return false;
      }
    }

    return true;
  });

  // Aggregated Stats
  const totalNetCommissions = filteredRecords.reduce((sum, r) => sum + (r.netCommission || 0), 0);
  const totalCodCollected = filteredRecords.reduce((sum, r) => sum + (r.codRequiredAmount || 0), 0);
  const totalItemsCount = filteredRecords.reduce((sum, r) => sum + (r.quantityOrOrdersCount || 0), 0);

  // Sort from newest to oldest
  filteredRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Group by date
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
        
        if (isToday) {
          dateStr = 'اليوم';
        } else if (isYesterday) {
          dateStr = 'أمس';
        } else {
          dateStr = new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
        }
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
              أرشيف كامل ودائم لجميع عمليات احتساب العمولات المسجلة في النظام مع إمكانية البحث والتصفية والطباعة.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => navigate('/commission/products')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="h-4 w-4" />
            <span>احتساب عمولة منتجات</span>
          </Button>
          <Button onClick={() => navigate('/commission/order-count')} variant="outline" className="gap-2">
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>عمولة عدد الطلبات</span>
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/50 border-emerald-200/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800 block">إجمالي العمولات المستحقة</span>
              <span className="text-xl font-black text-emerald-700">{totalNetCommissions.toFixed(2)} ر.س</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50/50 border-blue-200/80 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-800 block">إجمالي مبالغ التحصيل (COD)</span>
              <span className="text-xl font-black text-blue-700">{totalCodCollected.toFixed(2)} ر.س</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-700 text-white rounded-xl flex items-center justify-center shadow-sm">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-600 block">إجمالي الحركات والقطع</span>
              <span className="text-xl font-black text-slate-900">
                {filteredRecords.length} عملية <span className="text-xs font-normal text-slate-500">({totalItemsCount} قطعة/طلب)</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="البحث برقم العملية، اسم المندوب، أو الكود..."
                className="flex h-10 w-full rounded-xl border border-slate-300 pr-10 pl-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter by Representative */}
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="flex h-10 w-full rounded-xl border border-slate-300 pr-10 pl-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
              >
                <option value="">جميع المندوبين</option>
                {employees.map((e) => (
                  <option key={e.EmployeeID} value={e.EmployeeID}>
                    {e.ArabicName || e.EnglishName} ({e.EmployeeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Type */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <select
                className="flex h-10 w-full rounded-xl border border-slate-300 pr-10 pl-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
              >
                <option value="">جميع أنواع العمولات</option>
                <option value="PRODUCT_COMMISSION">عمولة منتجات</option>
                <option value="ORDER_COUNT_COMMISSION">عمولة عدد الطلبات</option>
              </select>
            </div>

            {/* Filter by Date */}
            <div className="relative">
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="date"
                className="flex h-10 w-full rounded-xl border border-slate-300 pr-10 pl-3 py-2 text-xs bg-white focus:ring-2 focus:ring-emerald-600"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || selectedEmployeeFilter || selectedTypeFilter || dateFilter) && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
              <span>تم العثور على {filteredRecords.length} نتيجة</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedEmployeeFilter('');
                  setSelectedTypeFilter('');
                  setDateFilter('');
                }}
                className="text-red-600 hover:text-red-700 h-7 text-xs"
              >
                إعادة ضبط التصفية
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Records Data Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">رقم العملية</th>
                <th className="px-4 py-3.5">التاريخ والوقت</th>
                <th className="px-4 py-3.5">اسم المندوب</th>
                <th className="px-4 py-3.5">نوع العمولة</th>
                <th className="px-4 py-3.5 text-center">عدد القطع / الطلبات</th>
                <th className="px-4 py-3.5 text-left">إجمالي العمولة</th>
                <th className="px-4 py-3.5 text-left">الخصم</th>
                <th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>
                <th className="px-4 py-3.5 text-left">المطلوب تحصيله</th>
                <th className="px-4 py-3.5 text-left">صافي العمولة</th>
                <th className="px-4 py-3.5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-12 text-center text-slate-400">
                    <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600">لا توجد سجلات عمولات مطابقة</p>
                    <p className="text-xs mt-1">قم بإجراء عملية احتساب عمولة جديدة لحفظها في هذا السجل.</p>
                  </td>
                </tr>
              ) : (
                Object.entries(groupedRecords).map(([dateLabel, records]) => (
                  <React.Fragment key={dateLabel}>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <td colSpan={11} className="px-4 py-2 font-bold text-slate-700 text-sm">
                        {dateLabel}
                      </td>
                    </tr>
                    {records.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setViewRecordModal(r)}
                        className="hover:bg-emerald-50/50 transition-colors cursor-pointer border-b border-slate-100 last:border-none"
                      >
                        <td className="px-4 py-3 font-mono font-bold text-slate-900" dir="ltr">
                          {r.transactionNo}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.formattedDate}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {r.employeeName}
                          <span className="block text-[10px] font-normal text-slate-400">{r.employeeCode}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              'inline-block px-2 py-0.5 rounded text-[11px] font-bold',
                              r.commissionType === 'PRODUCT_COMMISSION'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            )}
                          >
                            {r.commissionTypeLabel || (r.commissionType === 'PRODUCT_COMMISSION' ? 'عمولة منتجات' : 'عدد الطلبات')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">
                          {r.quantityOrOrdersCount}
                        </td>
                                                <td className="px-4 py-3 text-left font-medium text-slate-700">
                          {(r.grossCommission || 0).toFixed(2)} ر.س
                        </td>
                        <td className="px-4 py-3 text-left font-bold text-red-600">
                          {(() => {
                            const disc = r.discounts ? r.discounts.reduce((s, d) => s + (Number(d.amount)||0), 0) : (r.totalDiscounts || r.totalDiscount || 0);
                            return disc > 0 ? `-${disc.toFixed(2)} ر.س` : '-';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-left font-medium text-blue-700">
                          {(() => {
                            const pay = r.paymentItems ? r.paymentItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.onlinePaidAmount || 0);
                            return pay.toFixed(2) + ' ر.س';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-left font-bold text-amber-700">
                          {(() => {
                             const req = r.requiredItems ? r.requiredItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.totalRequiredAmount || r.totalOrderValue || 0);
                             return req.toFixed(2) + ' ر.س';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-left font-black text-emerald-700 text-sm">
                          {(() => {
                            if (r.finalRequiredAmount !== undefined && !isNaN(r.finalRequiredAmount)) return r.finalRequiredAmount.toFixed(2) + ' ر.س';
                            const req = r.requiredItems ? r.requiredItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.totalRequiredAmount || r.totalOrderValue || 0);
                            const pay = r.paymentItems ? r.paymentItems.reduce((s, i) => s + (Number(i.amount)||0), 0) : (r.onlinePaidAmount || 0);
                            const disc = r.discounts ? r.discounts.reduce((s, d) => s + (Number(d.amount)||0), 0) : (r.totalDiscounts || r.totalDiscount || 0);
                            const comm = r.grossCommission || 0;
                            return (req - pay - disc - comm).toFixed(2) + ' ر.س';
                          })()}
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="عرض التفاصيل"
                              className="h-8 w-8 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setViewRecordModal(r)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
    
                            <Button
                              variant="ghost"
                              size="icon"
                              title="طباعة الملخص (Print Summary)"
                              className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => setSelectedRecordForPrint(r)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
    
                            <Button
                              variant="ghost"
                              size="icon"
                              title="حذف السجل"
                              className="h-8 w-8 text-red-500 hover:bg-red-50"
                              onClick={(e) => handleDelete(r.id, e)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Record Details Modal */}
      {viewRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200">
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
                <span className="font-bold text-emerald-700">{viewRecordModal.commissionTypeLabel}</span>
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700">الملخص المالي التفصيلي:</h4>
              <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                  <span>إجمالي قيمة الطلب:</span>
                  <span className="font-bold">{viewRecordModal.totalOrderValue.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between p-2.5 border-b">
                  <span>المبلغ المدفوع أونلاين:</span>
                  <span className="font-bold text-blue-700">{viewRecordModal.onlinePaidAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                  <span>المبلغ المطلوب تحصيله عند الاستلام (COD):</span>
                  <span className="font-bold text-amber-700">{viewRecordModal.codRequiredAmount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between p-2.5 border-b">
                  <span>إجمالي العمولة قبل الخصم:</span>
                  <span className="font-bold">{viewRecordModal.grossCommission.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between p-2.5 bg-slate-50 border-b">
                  <span>قيمة الخصومات المقتطعة:</span>
                  <span className="font-bold text-red-600">-{viewRecordModal.totalDiscount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between p-3 bg-emerald-50 text-emerald-950 font-bold text-sm">
                  <span>صافي العمولة المستحقة:</span>
                  <span className="font-black text-emerald-700 text-base">
                    {viewRecordModal.netCommission.toFixed(2)} ر.س
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
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
