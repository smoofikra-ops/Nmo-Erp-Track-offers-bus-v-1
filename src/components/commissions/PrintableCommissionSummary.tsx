import React from 'react';
import { CommissionRecord } from '@/types/commissions';
import { Button } from '@/components/ui/button';
import { Printer, X, Building2, CheckCircle2 } from 'lucide-react';

interface PrintableCommissionSummaryProps {
  record: CommissionRecord;
  onClose?: () => void;
  autoPrint?: boolean;
}

export function PrintableCommissionSummary({
  record,
  onClose,
  autoPrint = false,
}: PrintableCommissionSummaryProps) {
  React.useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:fixed print:inset-0 print:z-50 print:block">
      {/* Top Floating Control Bar (Hidden when printing) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-xl shadow-lg print:hidden">
        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Printer className="h-4 w-4" />
          <span>طباعة الملخص (A4)</span>
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="outline" size="icon" className="h-9 w-9">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Printable Sheet Container */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden border border-slate-200 print:shadow-none print:border-none print:max-w-none print:w-full print:rounded-none my-8 print:my-0">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-summary-sheet, #printable-summary-sheet * {
              visibility: visible;
            }
            #printable-summary-sheet {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-shadow: none !important;
              background: white !important;
            }
            @page {
              size: A4 portrait;
              margin: 12mm;
            }
          }
        `}} />
        <div id="printable-summary-sheet" className="p-8 sm:p-10 font-sans text-right" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md print:border print:border-emerald-800">
                <Building2 className="h-9 w-9" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">شركة نمو الفكرة للتجارة</h1>
                <p className="text-xs text-slate-500 mt-0.5">قسم المحاسبة والمبيعات - إدارة العمولات</p>
                <span className="inline-block mt-1 text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                  سجل تجاري: 1010892341
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold mb-1 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>تقرير احتساب وخصم رسمي</span>
              </div>
              <h2 className="text-lg font-black text-slate-900">ملخص تسوية وعمولة مندوب</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5" dir="ltr">{record.transactionNo}</p>
            </div>
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80 mb-6">
            <div>
              <span className="block text-[11px] font-medium text-slate-500">رقم العملية</span>
              <span className="block text-sm font-bold text-slate-900 font-mono" dir="ltr">{record.transactionNo}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">التاريخ والوقت</span>
              <span className="block text-sm font-bold text-slate-900">{record.formattedDate}</span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">اسم المندوب</span>
              <span className="block text-sm font-bold text-slate-900">
                {record.employeeName} <span className="text-xs font-normal text-slate-500">({record.employeeCode})</span>
              </span>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-slate-500">نوع العمولة</span>
              <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded">
                {record.commissionTypeLabel}
              </span>
            </div>
          </div>

          {/* Details Section based on Commission Type */}
          {record.commissionType === 'PRODUCT_COMMISSION' && record.items && record.items.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل المنتجات والعمولات ({record.quantityOrOrdersCount} قطعة)</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">اسم المنتج</th>
                      <th className="p-2.5 text-center">الكمية</th>
                      <th className="p-2.5 text-left">عمولة الوحدة</th>
                      <th className="p-2.5 text-left">إجمالي عمولة المنتج</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.items.map((item, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="p-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="p-2.5 font-medium text-slate-900">{item.productName}</td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-2.5 text-left text-slate-600">{item.unitCommission.toFixed(2)} ر.س</td>
                        <td className="p-2.5 text-left font-bold text-emerald-700">{item.totalCommission.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {record.commissionType === 'ORDER_COUNT_COMMISSION' && record.orderCountDetails && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل عمولة الطلبات</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">البيان</th>
                      <th className="p-2.5 text-left">التفاصيل / القيمة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr className="bg-white border-b border-slate-100">
                      <td className="p-2.5 font-medium text-slate-900">إجمالي عدد الطلبات للعمولة</td>
                      <td className="p-2.5 text-left font-bold text-slate-800">{record.quantityOrOrdersCount} طلب</td>
                    </tr>
                    <tr className="bg-slate-50/50">
                      <td className="p-2.5 font-medium text-slate-900">إجمالي عمولة الطلبات</td>
                      <td className="p-2.5 text-left font-bold text-emerald-700">{record.grossCommission.toFixed(2)} ر.س</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Discounts Breakdown (If applied) */}
          {record.discounts && record.discounts.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل الخصومات</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-red-50 text-red-800 font-bold border-b border-red-200">
                    <tr>
                      <th className="p-2.5">بيان الخصم</th>
                      <th className="p-2.5 text-left">قيمة الخصم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.discounts.map((d, idx) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-2.5 font-medium text-slate-800">{d.name}</td>
                        <td className="p-2.5 text-left font-bold text-red-600">{d.amount.toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Comprehensive Financial Summary Breakdown Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">الملخص المالي النهائي والتسوية</h3>
            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 bg-emerald-50 text-emerald-950 font-bold">
                    <td className="p-3">إجمالي عمولة المندوب المستحقة</td>
                    <td className="p-3 text-left font-extrabold text-base text-emerald-700">
                      {record.grossCommission.toFixed(2)} ر.س
                    </td>
                  </tr>
                  
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3 font-medium text-slate-600">إجمالي المبلغ المطلوب تحصيله</td>
                    <td className="p-3 font-bold text-slate-900 text-left">{(record.totalRequiredAmount || record.totalOrderValue || 0).toFixed(2)} ر.س</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-3 font-medium text-slate-600">المبلغ المدفوع أونلاين</td>
                    <td className="p-3 font-bold text-blue-700 text-left">{(record.onlinePaidAmount || 0).toFixed(2)} ر.س</td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-3 font-medium text-slate-600">إجمالي الخصومات</td>
                    <td className="p-3 font-bold text-red-600 text-left">-{(record.totalDiscounts || record.totalDiscount || 0).toFixed(2)} ر.س</td>
                  </tr>
                  
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td className="p-3 text-slate-900">المبلغ النهائي المطلوب تحصيله من المندوب</td>
                    <td className="p-3 text-left font-black text-slate-900">
                      {record.finalRequiredAmount !== undefined ? record.finalRequiredAmount.toFixed(2) : ((record.totalRequiredAmount || record.totalOrderValue || 0) - (record.onlinePaidAmount || 0) - (record.totalDiscounts || record.totalDiscount || 0)).toFixed(2)} ر.س
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */}
          {record.notes && (
            <div className="mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">الملاحظات:</span>
              <p className="text-slate-700 whitespace-pre-line">{record.notes}</p>
            </div>
          )}

          {/* Signatures & Approvals */}
          <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <p className="font-bold text-slate-700 mb-10">توقيع المندوب</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <p className="text-[11px] font-medium text-slate-600">{record.employeeName}</p>
            </div>
            <div>
              <p className="font-bold text-slate-700 mb-10">الاعتماد (المحاسب / المسؤول)</p>
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <p className="text-[11px] font-medium text-slate-600">إدارة الحسابات</p>
            </div>
          </div>

          {/* Footer stamp */}
          <div className="mt-12 pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 flex justify-between items-center">
            <span>تم استخراج هذا المستند تلقائياً عبر نظام Nomu ERP</span>
            <span>تاريخ الطباعة: {new Date().toLocaleString('ar-SA')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
