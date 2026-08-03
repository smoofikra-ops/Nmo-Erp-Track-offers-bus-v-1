const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/PrintLayout.tsx', 'utf8');

code = code.replace(
  "interface PrintLayoutProps {\n  quote: Quote;\n}",
  "interface PrintLayoutProps {\n  quote: Quote;\n  isManagement?: boolean;\n}"
);

code = code.replace(
  "export function PrintLayout({ quote }: PrintLayoutProps) {",
  "export function PrintLayout({ quote, isManagement = false }: PrintLayoutProps) {"
);

const managementHeaderAddition = `
            {isManagement && (
              <div className="mt-2 inline-block bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded">نسخة الإدارة (داخلية)</div>
            )}
`;

code = code.replace(
  /<h2 className="text-3xl font-bold text-slate-800 mb-2">عرض سعر<\/h2>/,
  `<h2 className="text-3xl font-bold text-slate-800 mb-2">عرض سعر</h2>${managementHeaderAddition}`
);

const tableRegex = /<table className="w-full mb-8 text-sm border-collapse border border-slate-300">[\s\S]*?<\/table>/;
const newTable = `<table className="w-full mb-8 text-sm border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100 text-[13px]">
              <th className="border border-slate-300 p-2 font-bold text-right w-8">م</th>
              <th className="border border-slate-300 p-2 font-bold text-right">البيان</th>
              <th className="border border-slate-300 p-2 font-bold text-center">الكمية</th>
              {isManagement && <th className="border border-slate-300 p-2 font-bold text-center text-rose-700">التكلفة (للوحدة)</th>}
              <th className="border border-slate-300 p-2 font-bold text-center">سعر الوحدة</th>
              <th className="border border-slate-300 p-2 font-bold text-center">الإجمالي (شامل)</th>
              {isManagement && <th className="border border-slate-300 p-2 font-bold text-center text-rose-700">الربح</th>}
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item, index) => {
              const itemProfit = item.lineSellingPriceIncVat - item.linePurchaseCostIncVat;
              return (
              <tr key={item.id || item.productId}>
                <td className="border border-slate-300 p-2 text-center">{index + 1}</td>
                <td className="border border-slate-300 p-2">
                  <div className="font-bold">{item.productName}</div>
                  <div className="text-xs text-slate-500">{item.sku}</div>
                </td>
                <td className="border border-slate-300 p-2 text-center font-bold">
                  {item.quantity} 
                  <span className="text-[10px] text-slate-500 block font-normal">وحدة</span>
                </td>
                {isManagement && <td className="border border-slate-300 p-2 text-center text-rose-700">{item.unitPurchaseCostExVat.toFixed(2)}</td>}
                <td className="border border-slate-300 p-2 text-center">{item.unitSellingPriceIncVat.toFixed(2)}</td>
                <td className="border border-slate-300 p-2 text-center font-bold text-slate-800">{item.lineSellingPriceIncVat.toFixed(2)}</td>
                {isManagement && <td className="border border-slate-300 p-2 text-center font-bold text-emerald-600">{itemProfit.toFixed(2)}</td>}
              </tr>
            )})}
          </tbody>
        </table>`;

code = code.replace(tableRegex, newTable);

const totalsContainerRegex = /<div className="flex justify-end mb-12">[\s\S]*?<\/div>\s*<\/div>/;

const newTotals = `<div className={isManagement ? "grid grid-cols-2 gap-8 mb-12" : "flex justify-end mb-12"}>
          {isManagement && (
            <div className="bg-slate-50 p-4 border border-slate-200">
              <h3 className="font-bold text-rose-800 mb-3 border-b border-rose-200 pb-2">ملخص الإدارة المالي</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>إجمالي التكلفة:</span>
                  <span className="font-semibold">{quote.totals.purchaseCostExVat.toFixed(2)}</span>
                </div>
                {quote.totals.internalExpenseTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>رسوم داخلية:</span>
                    <span>{quote.totals.internalExpenseTotal.toFixed(2)}</span>
                  </div>
                )}
                {quote.totals.discountTotal > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>خصم للعميل:</span>
                    <span>{quote.totals.discountTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-emerald-700">
                  <span>الربح الإجمالي:</span>
                  <span>{quote.totals.netProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700">
                  <span>هامش الربح:</span>
                  <span>{quote.totals.profitMarginPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="w-80 ml-auto">
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
        </div>`;

code = code.replace(totalsContainerRegex, newTotals);

fs.writeFileSync('src/pages/Quotes/PrintLayout.tsx', code);
