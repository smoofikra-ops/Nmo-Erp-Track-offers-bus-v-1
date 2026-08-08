const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// Define getPaymentMethodLabel at the top level
const helper = `
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
`;

if (!code.includes('getPaymentMethodLabel')) {
    code = code.replace("interface PrintableCommissionSummaryProps {", helper + "\ninterface PrintableCommissionSummaryProps {");
}

const financialSectionRegex = /\{\/\* BOTTOM SECTION \(Financial Summary\) \*\/\}[\s\S]*?(?=<\/div>\s*<div className="flex justify-between items-end mt-8 text-\[11px\])/;

const newFinancialSection = `{/* BOTTOM SECTION (Financial Summary) */}
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
                     record.paymentItems.map((item) => (
                       <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                         <span className="text-slate-600 truncate max-w-[120px]" title={item.description || getPaymentMethodLabel(item.method)}>{item.description || getPaymentMethodLabel(item.method)}</span>
                         <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                       </div>
                     ))
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
                  <span className="font-bold">(-) إجمالي المدفوعات والتسويات (Payments & Settlements):</span>
                  <span className="font-mono font-bold">-{onlinePaid.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between items-center text-rose-600">
                  <span className="font-bold">(-) إجمالي الخصومات (Discounts):</span>
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
`;

code = code.replace(financialSectionRegex, newFinancialSection);
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
