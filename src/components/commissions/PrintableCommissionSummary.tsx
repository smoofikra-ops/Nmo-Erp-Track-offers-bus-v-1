import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CommissionRecord } from '@/types/commissions';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';


const getPaymentMethodLabel = (method: string) => {
  const methods: Record<string, string> = {
    CASH: 'كاش (نقدي)',
    ZID: 'مدفوعات زد (ZID)',
    BALANCE: 'تسوية رصيد',
    BANK_TRANSFER: 'تحويل بنكي',
    STC_PAY: 'STC Pay',
    CREDIT_SALE: 'آجل / ذمم',
    INTERMEDIARY_ACCOUNT: 'حساب وسيط',
    OTHER: 'أخرى',
  };
  return methods[method] || method;
};

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
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure styles and images are loaded
    const timer = setTimeout(() => {
      setIsReady(true);
      if (autoPrint) {
        handlePrint();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [autoPrint]);

  const setPrintTitle = () => {
    const originalTitle = document.title;
    const commTypeStr = record.commissionType === 'PRODUCT_COMMISSION' ? 'عمولة المنتجات' : 'عمولة الطلبات';
    const dateStr = record.createdAt ? record.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    document.title = `${commTypeStr} - ${record.employeeName} - ${dateStr}`;
    return originalTitle;
  };

  const handlePrint = () => {
    const orig = setPrintTitle();
    window.print();
    document.title = orig;
  };

  const commTypeLabel = record.commissionType === 'PRODUCT_COMMISSION' ? 'منتجات' : 'طلبات';
  
  const totalRequired = record.totalRequiredAmount || record.totalOrderValue || 0;
  const onlinePaid = record.onlinePaidAmount || 0;
  const discount = record.totalDiscounts || record.totalDiscount || 0;
  const commission = record.grossCommission || 0;
  const finalRequired = record.finalRequiredAmount !== undefined 
    ? record.finalRequiredAmount 
    : (totalRequired - onlinePaid - discount - commission);

  const PrintContent = (
    <div className="bg-white text-slate-900 mx-auto w-full max-w-4xl" dir="rtl" style={{ minHeight: '100vh' }}>
      
      {/* Action Bar (Not Printed) */}
      <div className="print:hidden fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex gap-3 bg-white/90 backdrop-blur shadow-lg border border-slate-200 p-2.5 rounded-2xl">
        <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
          <Printer className="h-4 w-4" />
          <span>طباعة التقرير</span>
        </Button>
        {onClose && (
          <Button variant="outline" onClick={onClose} className="hover:bg-slate-50 gap-2 border-slate-200">
            <X className="h-4 w-4" />
            <span>إغلاق</span>
          </Button>
        )}
      </div>

      {/* The Printable Page (1 A4 Page) */}
      {/* We use page-break-inside: avoid, and restrict height on print to ensure it fits one page */}
      <div className="print:block print:p-6 print:m-0 print:w-full max-w-[210mm] mx-auto p-8 font-sans h-full print:h-[297mm] flex flex-col justify-between">
        
        {/* TOP SECTION (Header + Metadata) */}
        <div>
          {/* Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-3">
              {settings?.LogoURL ? (
                <div className="h-10 flex items-center justify-center shrink-0">
                  <img src={settings.LogoURL} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : null}
              <div>
                <h1 className="text-xl font-black text-slate-900">{settings?.CompanyNameAR || 'الشركة'}</h1>
                <p className="text-[10px] text-slate-500 mt-0.5">قسم المحاسبة والمبيعات - تسوية مندوب</p>
              </div>
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold mb-1 border border-slate-200">
                تسوية مالية وعمولة
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5" dir="ltr">{record.transactionNo}</p>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px]">
            <div>
              <span className="block text-slate-500 mb-0.5">التاريخ والوقت</span>
              <span className="block font-bold text-slate-900">{record.formattedDate}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-0.5">المندوب</span>
              <span className="block font-bold text-slate-900">{record.employeeName}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-0.5">النوع</span>
              <span className="block font-bold text-slate-900">{commTypeLabel}</span>
            </div>
            <div>
              <span className="block text-slate-500 mb-0.5">الكمية</span>
              <span className="block font-bold text-slate-900">{record.quantityOrOrdersCount}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="mb-4">
            <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5 border-b pb-1">تفاصيل العمليات</h3>
            <table className="w-full text-[10px] text-right border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-300">
                  <th className="py-1.5 px-2 font-bold">العنصر</th>
                  <th className="py-1.5 px-2 font-bold text-center">الكمية/الطلبات</th>
                  <th className="py-1.5 px-2 font-bold">نسبة العمولة</th>
                  <th className="py-1.5 px-2 font-bold text-left">قيمة العمولة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.items && record.items.length > 0 ? (
                  record.items.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2 font-semibold text-slate-900 truncate max-w-[150px]">{d.productName}</td>
                      <td className="py-1.5 px-2 text-center font-mono">{d.quantity}</td>
                      <td className="py-1.5 px-2 text-slate-600">{d.unitCommission} {record.commissionType === 'PRODUCT_COMMISSION' ? '%' : 'ر.س'}</td>
                      <td className="py-1.5 px-2 font-bold text-left font-mono">{d.totalCommission.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-2 text-center text-slate-400 italic">لا توجد تفاصيل (عمولة مجمعة)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BOTTOM SECTION (Financial Summary) */}
        <div className="mt-auto pt-4 border-t-2 border-slate-200">
          
          <h3 className="text-[14px] font-black text-slate-800 mb-3 uppercase tracking-wide text-center">الملخص المالي وتسوية العهدة</h3>
          
          <div className="flex flex-col gap-3">
             {/* Grid for the 3 detailed sections */}
             <div className="grid grid-cols-3 gap-3 mb-1">
               {/* 1. Required Amount Details */}
               <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                 <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">تفاصيل المبالغ المطلوبة</h4>
                 <div className="space-y-1.5 text-[10px]">
                   {record.requiredItems && record.requiredItems.length > 0 ? (
                     record.requiredItems.map((item) => (
                       <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                         <span className="text-slate-600 truncate max-w-[120px]" title={item.description}>{item.description}</span>
                         <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                       </div>
                     ))
                   ) : (
                     <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                   )}
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                   <span className="text-[10px] font-bold text-slate-800">الإجمالي</span>
                   <span className="text-[11px] font-black font-mono text-slate-900">{totalRequired.toFixed(2)}</span>
                 </div>
               </div>

               {/* 2. Payment & Settlement Details */}
               <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                 <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">تفاصيل المدفوعات والتسويات</h4>
                 <div className="space-y-1.5 text-[10px]">
                   {record.paymentItems && record.paymentItems.length > 0 ? (
                     record.paymentItems.map((item) => {
                       const methodLabel = getPaymentMethodLabel(item.method);
                       const hasCustomDesc = item.description && item.description.trim() !== '' && item.description.trim() !== methodLabel;
                       return (
                         <div key={item.id} className="flex justify-between items-start border-b border-slate-100 pb-1 gap-1">
                           <div className="flex flex-col text-right min-w-0">
                             <span className="font-bold text-slate-800">{methodLabel}</span>
                             {hasCustomDesc && (
                               <span className="text-[9px] text-slate-500 truncate max-w-[120px]" title={item.description}>
                                 {item.description}
                               </span>
                             )}
                           </div>
                           <span className="font-mono font-bold text-slate-900 shrink-0">
                             {Number(item.amount || 0).toFixed(2)}
                           </span>
                         </div>
                       );
                     })
                   ) : (
                     <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                   )}
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                   <span className="text-[10px] font-bold text-slate-800">الإجمالي</span>
                   <span className="text-[11px] font-black font-mono text-slate-900">{onlinePaid.toFixed(2)}</span>
                 </div>
               </div>

               {/* 3. Discount Details */}
               <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                 <h4 className="text-[10px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">تفاصيل الخصومات</h4>
                 <div className="space-y-1.5 text-[10px]">
                   {record.discounts && record.discounts.length > 0 ? (
                     record.discounts.map((item) => (
                       <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                         <span className="text-slate-600 truncate max-w-[120px]" title={item.name || (item as any).description}>{item.name || (item as any).description}</span>
                         <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                       </div>
                     ))
                   ) : (
                     <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                   )}
                 </div>
                 <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                   <span className="text-[10px] font-bold text-slate-800">الإجمالي</span>
                   <span className="text-[11px] font-black font-mono text-slate-900">{discount.toFixed(2)}</span>
                 </div>
               </div>
             </div>

            {/* FINAL ACCOUNTING SUMMARY */}
            <div className="bg-white border-2 border-slate-300 rounded-xl p-3 w-full shadow-sm">
              
              {/* Calculation Lines */}
              <div className="space-y-1.5 text-[11px] mb-3 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-bold">إجمالي المبلغ المطلوب (Required Amount):</span>
                  <span className="font-mono font-bold text-slate-900">{totalRequired.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-blue-700">
                  <span className="font-bold">(-) إجمالي المدفوعات والتسويات :</span>
                  <span className="font-mono font-bold">-{onlinePaid.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-rose-600">
                  <span className="font-bold">(-) إجمالي الخصومات :</span>
                  <span className="font-mono font-bold">-{discount.toFixed(2)} ر.س</span>
                </div>
                <div className="border-t border-slate-300 my-1"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-bold">المبلغ قبل احتساب العمولة (Amount Before Commission):</span>
                  <span className="font-mono font-bold text-slate-900">{(totalRequired - onlinePaid - discount).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span className="font-bold">(-) عمولة مندوب المبيعات (Sales Rep Commission):</span>
                  <span className="font-mono font-bold">-{commission.toFixed(2)} ر.س</span>
                </div>
              </div>

              {/* FINAL AMOUNT HIGHLIGHT */}
              <div className="bg-slate-900 rounded-lg p-3.5 flex justify-between items-center text-white shadow-md border border-slate-800 print:bg-slate-900 print:text-white" style={{ backgroundColor: '#0f172a', color: '#fff', borderColor: '#0f172a' }}>
                <div className="flex flex-col">
                  <span className="text-sm font-bold print:text-white" style={{ color: '#fff' }}>صافي المبلغ النهائي المطلوب توريده</span>
                  <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold print:text-slate-200" style={{ color: '#cbd5e1' }}>FINAL AMOUNT TO COLLECT</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono tracking-tight text-emerald-400 print:text-emerald-400" style={{ color: '#34d399' }}>{finalRequired.toFixed(2)}</span>
                  <span className="text-sm font-bold ml-1.5 text-slate-300 print:text-slate-200" style={{ color: '#cbd5e1' }}>ر.س</span>
                </div>
              </div>
              
            </div>
          </div>
          <div className="flex justify-between items-end mt-8 text-[11px] border-t pt-4 border-slate-200">
            <div className="text-center w-1/3">
              <span className="block text-slate-500 mb-6">توقيع المحاسب / الإدارة</span>
              <span className="block border-t border-slate-300 mx-4 pt-1 text-slate-700">.............................</span>
            </div>
            <div className="text-center w-1/3">
              <span className="block text-slate-500 mb-1">تاريخ الطباعة</span>
              <span className="block font-mono text-slate-700" dir="ltr">{new Date().toLocaleString('en-GB')}</span>
              <span className="block text-slate-400 mt-1">بواسطة: {user?.name || 'النظام'}</span>
            </div>
            <div className="text-center w-1/3">
              <span className="block text-slate-500 mb-6">توقيع المندوب بالاستلام والمصادقة</span>
              <span className="block border-t border-slate-300 mx-4 pt-1 text-slate-700">.............................</span>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          #root { display: none !important; }
          .fixed.inset-0 { position: relative !important; }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          * {
            break-inside: avoid !important;
          }
        }
      `}} />
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-white print:bg-white overflow-y-auto">
      {isReady && PrintContent}
    </div>,
    document.body
  );
}
