const fs = require('fs');

const code = `import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CommissionRecord } from '@/types/commissions';
import { useSettings } from '@/contexts/SettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';

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
    const finalReq = record.finalRequiredAmount !== undefined 
      ? record.finalRequiredAmount 
      : ((record.totalRequiredAmount || record.totalOrderValue || 0) - (record.onlinePaidAmount || 0) - (record.totalDiscounts || record.totalDiscount || 0) - record.grossCommission);
    const dateStr = record.createdAt ? record.createdAt.split('T')[0] : new Date().toISOString().split('T')[0];
    
    document.title = \`\${commTypeStr} - \${record.employeeName} - \${dateStr}\`;
    return originalTitle;
  };

  const handlePrint = () => {
    const orig = setPrintTitle();
    window.print();
    document.title = orig;
  };

  const getPaymentName = (type: string, desc: string) => {
    const t = (type || '').toUpperCase();
    if (t === 'BALANCE') return 'موازنة';
    if (t === 'CASH') return 'كاش';
    if (t === 'BANK_TRANSFER') return 'تحويل بنكي';
    if (t === 'STC_PAY') return 'STC Pay';
    if (t === 'CREDIT') return 'بيع آجل';
    if (t === 'ZID') return 'زد (ZID)';
    return desc || type || 'أخرى';
  };

  const commTypeLabel = record.commissionType === 'PRODUCT_COMMISSION' ? 'عمولة منتجات' : 'عمولة طلبات';
  
  const requiredTotal = record.requiredItems ? record.requiredItems.reduce((s, i) => s + Number(i.amount), 0) : (record.totalRequiredAmount || record.totalOrderValue || 0);
  const paymentTotal = record.paymentItems ? record.paymentItems.reduce((s, i) => s + Number(i.amount), 0) : (record.onlinePaidAmount || 0);
  const discountTotal = record.discounts ? record.discounts.reduce((s, d) => s + Number(d.amount), 0) : (record.totalDiscounts || record.totalDiscount || 0);
  
  const beforeComm = requiredTotal - paymentTotal - discountTotal;
  const netRequired = record.finalRequiredAmount !== undefined ? record.finalRequiredAmount : (beforeComm - record.grossCommission);

  const printContent = (
    <div id="print-content-wrapper" className="bg-white text-slate-900 w-full mx-auto font-sans text-right p-4 sm:p-6" dir="rtl">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between border-b-2 border-emerald-600 pb-3 mb-4">
        <div className="flex items-center gap-3">
          {settings?.LogoURL ? (
            <div className="h-12 flex items-center justify-center shrink-0">
              <img src={settings.LogoURL} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          ) : null}
          <div>
            <h1 className="text-lg font-black text-emerald-800">{settings?.CompanyNameAR || 'الشركة'}</h1>
            <p className="text-[10px] text-slate-500 mt-0.5">قسم المحاسبة والمبيعات - إدارة العمولات</p>
            {(settings?.CommercialRecord || settings?.TaxNumber) && (
              <p className="text-[9px] text-slate-400 mt-0.5 font-mono">
                {settings.CommercialRecord && \`س.ت: \${settings.CommercialRecord}\`}
                {settings.CommercialRecord && settings.TaxNumber && ' | '}
                {settings.TaxNumber && \`ر.ض: \${settings.TaxNumber}\`}
              </p>
            )}
          </div>
        </div>
        <div className="text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[11px] font-bold mb-1 border border-emerald-200">
            ملخص تسوية وعمولة مندوب
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5" dir="ltr">{record.transactionNo}</p>
        </div>
      </div>

      {/* 2. Operation Data */}
      <div className="grid grid-cols-5 gap-2 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px]">
        <div>
          <span className="block text-slate-500 mb-0.5">رقم العملية</span>
          <span className="block font-bold text-slate-900 font-mono" dir="ltr">{record.transactionNo}</span>
        </div>
        <div>
          <span className="block text-slate-500 mb-0.5">التاريخ والوقت</span>
          <span className="block font-bold text-slate-900">{record.formattedDate}</span>
        </div>
        <div>
          <span className="block text-slate-500 mb-0.5">المندوب</span>
          <span className="block font-bold text-slate-900">{record.employeeName}</span>
        </div>
        <div>
          <span className="block text-slate-500 mb-0.5">نوع العمولة</span>
          <span className="block font-bold text-emerald-700">{commTypeLabel}</span>
        </div>
        <div>
          <span className="block text-slate-500 mb-0.5">الكمية/الطلبات</span>
          <span className="block font-bold text-slate-900">{record.quantityOrOrdersCount}</span>
        </div>
      </div>

      {/* 3. Products & Commissions */}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5">تفاصيل العمولات</h3>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-[10px] text-right border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="p-1.5">المنتج / البيان</th>
                <th className="p-1.5 text-center">الكمية</th>
                <th className="p-1.5 text-center">عمولة الوحدة</th>
                <th className="p-1.5 text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {record.items && record.items.length > 0 ? (
                record.items.map((item: any, idx: number) => (
                  <tr key={idx} className="bg-white">
                    <td className="p-1.5 font-medium">{item.productName || item.sku}</td>
                    <td className="p-1.5 text-center">{item.quantity}</td>
                    <td className="p-1.5 text-center">{Number(item.unitCommission).toFixed(2)}</td>
                    <td className="p-1.5 text-left font-bold text-emerald-700">{Number(item.totalCommission).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr className="bg-white">
                  <td className="p-1.5 font-medium">عمولة بناءً على عدد الطلبات</td>
                  <td className="p-1.5 text-center">{record.quantityOrOrdersCount}</td>
                  <td className="p-1.5 text-center">-</td>
                  <td className="p-1.5 text-left font-bold text-emerald-700">{record.grossCommission.toFixed(2)}</td>
                </tr>
              )}
              <tr className="bg-slate-50 font-bold">
                <td className="p-1.5 text-slate-900 text-left">الإجمالي:</td>
                <td className="p-1.5 text-center text-slate-900">{record.quantityOrOrdersCount}</td>
                <td className="p-1.5"></td>
                <td className="p-1.5 text-left text-emerald-700">{record.grossCommission.toFixed(2)} ر.س</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid for Amounts and Payments to save space */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 4. Required Amounts */}
        <div>
          <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5">المبالغ المطلوبة</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-[10px] text-right border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-1.5">الوصف</th>
                  <th className="p-1.5 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {record.requiredItems && record.requiredItems.length > 0 ? (
                  record.requiredItems.map((item: any, idx: number) => (
                    <tr key={idx} className="bg-white">
                      <td className="p-1.5 font-medium">{item.description}</td>
                      <td className="p-1.5 text-left">{Number(item.amount).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="bg-white">
                    <td className="p-1.5 font-medium">مبيعات نقدية</td>
                    <td className="p-1.5 text-left">{requiredTotal.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-bold">
                  <td className="p-1.5 text-slate-900">إجمالي المطلوب</td>
                  <td className="p-1.5 text-left text-slate-900">{requiredTotal.toFixed(2)} ر.س</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 5 & 6. Payments and Discounts */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5">الدفعات والتسويات</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-[10px] text-right border-collapse">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-1.5">النوع / الوصف</th>
                    <th className="p-1.5 text-left">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {record.paymentItems && record.paymentItems.length > 0 ? (
                    record.paymentItems.map((item: any, idx: number) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-1.5 font-medium">{getPaymentName(item.type, item.description)}</td>
                        <td className="p-1.5 text-left text-blue-700">{Number(item.amount).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr className="bg-white">
                      <td className="p-1.5 font-medium text-slate-400">لا توجد دفعات</td>
                      <td className="p-1.5 text-left text-slate-400">0.00</td>
                    </tr>
                  )}
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-1.5 text-slate-900">إجمالي المدفوع</td>
                    <td className="p-1.5 text-left text-blue-700">{paymentTotal.toFixed(2)} ر.س</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {record.discounts && record.discounts.length > 0 && (
            <div>
              <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5">الخصومات</h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[10px] text-right border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {record.discounts.map((d: any, idx: number) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-1.5 font-medium">{d.name || d.description}</td>
                        <td className="p-1.5 text-left font-bold text-red-600">{Number(d.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-1.5 text-slate-900">إجمالي الخصومات</td>
                      <td className="p-1.5 text-left text-red-600">{discountTotal.toFixed(2)} ر.س</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. Final Financial Summary Table */}
      <div className="mb-4">
        <h3 className="text-[11px] font-bold text-slate-700 uppercase mb-1.5">الملخص المالي النهائي</h3>
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-[11px] border-collapse">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-white">
                <td className="p-2 font-medium text-slate-600">إجمالي المبالغ المطلوبة</td>
                <td className="p-2 font-bold text-slate-900 text-left">{requiredTotal.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2 font-medium text-slate-600">ناقص: إجمالي الدفعات والتسويات</td>
                <td className="p-2 font-bold text-blue-700 text-left">-{paymentTotal.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-white">
                <td className="p-2 font-medium text-slate-600">ناقص: إجمالي الخصومات</td>
                <td className="p-2 font-bold text-red-600 text-left">-{discountTotal.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-slate-50 font-bold">
                <td className="p-2 text-slate-700">المبلغ قبل خصم العمولة</td>
                <td className="p-2 text-left text-slate-800">{beforeComm.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-white font-bold">
                <td className="p-2 text-emerald-800">ناقص: عمولة المندوب المستحقة</td>
                <td className="p-2 text-left text-emerald-700">-{record.grossCommission.toFixed(2)} ر.س</td>
              </tr>
              <tr className="bg-emerald-50 font-black text-sm border-t-2 border-emerald-200">
                <td className="p-2.5 text-emerald-950">صافي المطلوب تحصيله من المندوب</td>
                <td className="p-2.5 text-left text-emerald-900">{netRequired.toFixed(2)} ر.س</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Signatures & Footer */}
      <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-[10px] relative">
        {settings?.StampImageURL && (
           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
             <img src={settings.StampImageURL} alt="Stamp" className="w-24 h-24 object-contain" />
           </div>
        )}
        <div>
          <p className="font-bold text-slate-700 mb-8">توقيع المندوب</p>
          <div className="border-b border-slate-400 w-2/3 mx-auto mb-1.5"></div>
          <p className="font-medium text-slate-600">{record.employeeName}</p>
        </div>
        <div>
          <p className="font-bold text-slate-700 mb-2">الاعتماد (إدارة الحسابات)</p>
          {settings?.SignatureImageURL ? (
            <img src={settings.SignatureImageURL} alt="Signature" className="h-6 mx-auto mb-1 object-contain" />
          ) : (
            <div className="h-6 mb-1"></div>
          )}
          <div className="border-b border-slate-400 w-2/3 mx-auto mb-1.5"></div>
          <p className="font-medium text-slate-600">المحاسب المسؤول</p>
        </div>
      </div>

      <div className="mt-6 pt-2 border-t border-slate-200 text-[8px] text-slate-400 flex justify-between items-end print:block print:w-full">
        <div className="flex flex-col gap-0.5 text-right">
          <span>تم الإنشاء بواسطة: NmoLabs Flow ERP</span>
          <span>تاريخ الطباعة: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('ar-SA')}</span>
        </div>
        <div className="flex flex-col gap-0.5 text-left">
          <span>Printed By: {user?.name || 'System'}</span>
          <span>صفحة 1 من 1</span>
        </div>
      </div>

    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: \`
        @media print {
          /* Hide EVERYTHING in body except our dedicated portal */
          body > *:not(#dedicated-print-portal) {
            display: none !important;
          }
          /* Ensure the portal is visible and takes full width */
          #dedicated-print-portal {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          /* Prevent page breaking where possible */
          .border-collapse, tr, td, th {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
        }
      \`}} />

      {/* On-screen Modal View */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:hidden">
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-xl shadow-lg">
          <Button onClick={handlePrint} disabled={!isReady} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Printer className="h-4 w-4" />
            <span>طباعة الملخص (A4)</span>
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="icon" className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-auto overflow-hidden border border-slate-200 my-8">
          {printContent}
        </div>
      </div>
      
      {/* Hidden Print-Only DOM element injected directly to body to ensure no duplicates */}
      {createPortal(
        <div id="dedicated-print-portal" className="hidden print:block">
          {printContent}
        </div>,
        document.body
      )}
    </>
  );
}
`;

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
console.log("Wrote printable component.");
