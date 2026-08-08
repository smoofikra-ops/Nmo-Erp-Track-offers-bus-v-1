const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

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
  code = code.replace("export function CommissionRecords() {", helper + "\nexport function CommissionRecords() {");
}

const oldModalRegex = /\{canViewFinancials && \([\s\S]*?\}\) ر\.س\n\s*<\/span>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/;

const newModal = `{canViewFinancials && (
              <div className="space-y-4">
                
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b pb-1">الملخص المالي وتسوية العهدة</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1. Required Amount Details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">تفاصيل المبالغ المطلوبة</h5>
                    <div className="space-y-1.5 text-[11px]">
                      {viewRecordModal.requiredItems && viewRecordModal.requiredItems.length > 0 ? (
                        viewRecordModal.requiredItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                            <span className="text-slate-600 truncate pr-2">{item.description}</span>
                            <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                      <span className="text-[11px] font-bold text-slate-800">الإجمالي</span>
                      <span className="text-xs font-black font-mono text-slate-900">{(viewRecordModal.totalRequiredAmount || viewRecordModal.totalOrderValue || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 2. Payment & Settlement Details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">المدفوعات والتسويات</h5>
                    <div className="space-y-1.5 text-[11px]">
                      {viewRecordModal.paymentItems && viewRecordModal.paymentItems.length > 0 ? (
                        viewRecordModal.paymentItems.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                            <span className="text-slate-600 truncate pr-2">{item.description || getPaymentMethodLabel(item.method)}</span>
                            <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                      <span className="text-[11px] font-bold text-slate-800">الإجمالي</span>
                      <span className="text-xs font-black font-mono text-slate-900">{(viewRecordModal.onlinePaidAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 3. Discount Details */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                    <h5 className="text-[11px] font-bold text-slate-700 uppercase mb-2 border-b border-slate-300 pb-1">تفاصيل الخصومات</h5>
                    <div className="space-y-1.5 text-[11px]">
                      {viewRecordModal.discounts && viewRecordModal.discounts.length > 0 ? (
                        viewRecordModal.discounts.map((item) => (
                          <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-1">
                            <span className="text-slate-600 truncate pr-2">{item.name || (item as any).description}</span>
                            <span className="font-mono font-bold text-slate-900">{item.amount.toFixed(2)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-slate-400 italic">التفاصيل مدمجة</div>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1 border-t-2 border-slate-300">
                      <span className="text-[11px] font-bold text-slate-800">الإجمالي</span>
                      <span className="text-xs font-black font-mono text-slate-900">{(viewRecordModal.totalDiscounts || viewRecordModal.totalDiscount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* FINAL ACCOUNTING SUMMARY */}
                <div className="bg-white border-2 border-slate-300 rounded-xl p-4 w-full shadow-sm">
                  <div className="space-y-2 text-xs mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-800 font-bold">إجمالي المبلغ المطلوب (Required Amount):</span>
                      <span className="font-mono font-bold text-slate-900">{(viewRecordModal.totalRequiredAmount || viewRecordModal.totalOrderValue || 0).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-blue-700">
                      <span className="font-bold">(-) إجمالي المدفوعات والتسويات (Payments):</span>
                      <span className="font-mono font-bold">-{(viewRecordModal.onlinePaidAmount || 0).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-600">
                      <span className="font-bold">(-) إجمالي الخصومات (Discounts):</span>
                      <span className="font-mono font-bold">-{(viewRecordModal.totalDiscounts || viewRecordModal.totalDiscount || 0).toFixed(2)} ر.س</span>
                    </div>
                    <div className="border-t border-slate-300 my-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-800 font-bold">المبلغ قبل احتساب العمولة:</span>
                      <span className="font-mono font-bold text-slate-900">{((viewRecordModal.totalRequiredAmount || viewRecordModal.totalOrderValue || 0) - (viewRecordModal.onlinePaidAmount || 0) - (viewRecordModal.totalDiscounts || viewRecordModal.totalDiscount || 0)).toFixed(2)} ر.س</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-700">
                      <span className="font-bold">(-) عمولة مندوب المبيعات:</span>
                      <span className="font-mono font-bold">-{(viewRecordModal.grossCommission || 0).toFixed(2)} ر.س</span>
                    </div>
                  </div>

                  {/* FINAL AMOUNT HIGHLIGHT */}
                  <div className="bg-slate-900 rounded-lg p-4 flex justify-between items-center text-white shadow-md border border-slate-800">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">صافي المبلغ النهائي المطلوب توريده</span>
                      <span className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">FINAL AMOUNT TO COLLECT</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono tracking-tight text-emerald-400">
                        {viewRecordModal.finalRequiredAmount !== undefined ? viewRecordModal.finalRequiredAmount.toFixed(2) : ((viewRecordModal.totalRequiredAmount || viewRecordModal.totalOrderValue || 0) - (viewRecordModal.onlinePaidAmount || 0) - (viewRecordModal.totalDiscounts || viewRecordModal.totalDiscount || 0) - (viewRecordModal.grossCommission || 0)).toFixed(2)}
                      </span>
                      <span className="text-sm font-bold ml-1.5 text-slate-300">ر.س</span>
                    </div>
                  </div>
                </div>
              </div>
            )}`;

code = code.replace(oldModalRegex, newModal);
fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
