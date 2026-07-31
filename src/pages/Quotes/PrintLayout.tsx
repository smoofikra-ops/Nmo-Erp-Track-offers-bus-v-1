import React from 'react';
import { Quote } from '@/types/quotes';
import { useSettings } from '@/contexts/SettingsContext';

interface PrintLayoutProps {
  quote: Quote;
}

export function PrintLayout({ quote }: PrintLayoutProps) {
  const { settings } = useSettings();
  const companyProfile = {
    name: settings.CompanyNameAr || 'شركة نومو للتجارة',
    vatNumber: settings.VATNumber || '310000000000003',
    phone: settings.Mobile || settings.Phone || '0500000000',
    email: settings.Email || 'info@nomu.example.com',
    address: settings.Address || 'الرياض، المملكة العربية السعودية'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #quote-print-area, #quote-print-area * { visibility: visible; }
          #quote-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          tr { page-break-inside: avoid; }
          .no-print { display: none !important; }
        }
      `}} />
      <div className="bg-white text-black p-8 mx-auto max-w-4xl min-h-[297mm]" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{companyProfile.name}</h1>
            <div className="text-sm text-slate-600">الرقم الضريبي: {companyProfile.vatNumber}</div>
            <div className="text-sm text-slate-600">الجوال: {companyProfile.phone}</div>
            <div className="text-sm text-slate-600">البريد: {companyProfile.email}</div>
            <div className="text-sm text-slate-600">العنوان: {companyProfile.address}</div>
          </div>
          <div className="text-left">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">عرض سعر</h2>
            <div className="text-sm"><span className="font-semibold inline-block w-20">رقم العرض:</span> {quote.quoteNumber || quote.id}</div>
            <div className="text-sm"><span className="font-semibold inline-block w-20">تاريخ الإصدار:</span> {new Date(quote.createdAt || Date.now()).toLocaleDateString('ar-SA')}</div>
            {quote.validUntil && (
              <div className="text-sm"><span className="font-semibold inline-block w-20">صالح حتى:</span> {new Date(quote.validUntil).toLocaleDateString('ar-SA')}</div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-3 bg-slate-100 p-2">بيانات العميل</h3>
          <div className="grid grid-cols-2 gap-4 px-2">
            <div><span className="font-semibold w-24 inline-block">اسم العميل:</span> {quote.customerName || '-'}</div>
            <div><span className="font-semibold w-24 inline-block">الجوال:</span> <span dir="ltr">{quote.customerPhone || '-'}</span></div>
            <div className="col-span-2"><span className="font-semibold w-24 inline-block">العنوان:</span> {quote.title}</div>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2 font-bold text-right w-12">م</th>
              <th className="border border-slate-300 p-2 font-bold text-right">البيان</th>
              <th className="border border-slate-300 p-2 font-bold text-center">الوحدة</th>
              <th className="border border-slate-300 p-2 font-bold text-center">الكمية</th>
              <th className="border border-slate-300 p-2 font-bold text-center">السعر</th>
              <th className="border border-slate-300 p-2 font-bold text-center">الإجمالي (شامل)</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => (
              <tr key={item.id || item.productId}>
                <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                <td className="border border-slate-300 p-2">
                  <div className="font-bold">{item.productName}</div>
                  <div className="text-xs text-slate-500">{item.sku}</div>
                </td>
                <td className="border border-slate-300 p-2 text-center">{item.offerUnitName}</td>
                <td className="border border-slate-300 p-2 text-center font-bold">{item.quantity}</td>
                <td className="border border-slate-300 p-2 text-center">{item.unitSellingPriceIncVat.toFixed(2)}</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{item.lineSellingPriceIncVat.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-12">
          <div className="w-80">
            <div className="flex justify-between border-b border-slate-200 py-2">
              <span>الإجمالي (بدون ضريبة):</span>
              <span>{quote.totals.retailValueExVat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 py-2">
              <span>الضريبة (15%):</span>
              <span>{quote.totals.outputVat.toFixed(2)}</span>
            </div>
            
            {quote.totals.discountTotal > 0 && (
              <div className="flex justify-between border-b border-slate-200 py-2 text-rose-600">
                <span>الخصم:</span>
                <span>-{quote.totals.discountTotal.toFixed(2)}</span>
              </div>
            )}
            
            {quote.adjustments?.filter(a => a.type === 'addition').map(adj => (
              <div key={adj.id} className="flex justify-between border-b border-slate-200 py-2 text-indigo-600">
                <span>{adj.name}:</span>
                <span>+{adj.calculatedAmount.toFixed(2)}</span>
              </div>
            ))}

            <div className="flex justify-between border-b-2 border-slate-800 py-3 font-bold text-lg">
              <span>الإجمالي النهائي:</span>
              <span>{quote.totals.finalQuotePriceIncVat.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {/* Terms and Signatures */}
        <div className="grid grid-cols-2 gap-12 text-sm mt-12">
          <div>
            <h3 className="font-bold mb-2">الشروط والأحكام:</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>الأسعار المعروضة صالحة حتى تاريخ الانتهاء المذكور.</li>
              <li>أي تعديل في الكميات قد يؤدي إلى تغيير في الأسعار.</li>
              <li>التوريد حسب توفر المخزون.</li>
            </ul>
          </div>
          <div className="text-center pt-8">
            <div className="font-bold mb-12 border-t border-slate-300 pt-4 w-64 mx-auto">الختم والتوقيع</div>
          </div>
        </div>
      </div>
    </>
  );
}
