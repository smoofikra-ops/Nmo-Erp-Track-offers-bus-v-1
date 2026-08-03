const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');

const summaryRegex = /<div className="space-y-2 text-sm border-b border-slate-100 pb-3">\s*<div className="flex justify-between text-slate-600">[\s\S]*?<div className="text-xl font-bold text-slate-900">\s*<span>\{totals.finalQuotePriceIncVat.toFixed\(2\)\}<\/span>/;

const replacement = `<div className="space-y-3 text-sm border-b border-slate-200 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>عدد الأصناف</span>
                <span className="font-semibold text-slate-800">{cartItems.length}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>عدد الوحدات</span>
                <span className="font-semibold text-slate-800">{totals.totalPieces}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-100">
                <span>إجمالي قيمة المنتجات (قبل الضريبة)</span>
                <span className="font-semibold text-slate-800">{totals.retailValueExVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>إجمالي الضريبة</span>
                <span className="font-semibold text-slate-800">{totals.outputVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-100">
                <span>إجمالي المنتجات (شامل الضريبة)</span>
                <span>{totals.retailValueIncVat.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm border-b border-slate-100 pb-3">
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>إجمالي الخصومات (-)</span>
                  <span>{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.additionTotal > 0 && (
                <div className="flex justify-between text-indigo-600">
                  <span>إضافات أخرى (+)</span>
                  <span>{totals.additionTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm font-semibold text-slate-700">القيمة النهائية للعرض<br/><span className="text-xs text-slate-500 font-normal">التي سيدفعها العميل</span></div>
              <div className="text-xl font-bold text-slate-900">
                <span>{totals.finalQuotePriceIncVat.toFixed(2)}</span>`;

code = code.replace(summaryRegex, replacement);

const internalRegex = /<h3 className="font-semibold text-sm text-slate-800 mb-3">الحسابات الداخلية \(إدارة\)<\/h3>[\s\S]*?<\/div>\s*<\/CardContent>/;
const internalReplacement = `<h3 className="font-semibold text-sm text-slate-800 mb-3">البيانات الداخلية (إدارة)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>إجمالي التكلفة</span>
                <span className="font-semibold">{totals.purchaseCostExVat.toFixed(2)}</span>
              </div>
              {totals.internalExpenseTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>رسوم داخلية (عمولات/توصيل)</span>
                  <span>{totals.internalExpenseTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>أي خصومات للعميل</span>
                  <span>{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="font-semibold text-slate-800">إجمالي الربح</span>
                <span className="font-bold text-emerald-600">{totals.netProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-800">هامش الربح %</span>
                <span className="font-bold text-indigo-600">{totals.profitMarginPercent.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 bg-emerald-50 p-2 rounded">
                <span className="font-bold text-emerald-800">صافي الربح المتوقع</span>
                <span className="font-black text-emerald-700">{totals.netProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>`;
code = code.replace(internalRegex, internalReplacement);

fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', code);
