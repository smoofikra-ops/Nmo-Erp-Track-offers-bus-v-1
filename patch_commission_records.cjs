const fs = require('fs');
let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

const replacement = `                        <td className="px-4 py-3 text-left font-medium text-slate-700">
                          {(r.grossCommission || 0).toFixed(2)} ر.س
                        </td>
                        <td className="px-4 py-3 text-left font-bold text-red-600">
                          {(() => {
                            const disc = r.discounts ? r.discounts.reduce((s, d) => s + (Number(d.amount)||0), 0) : (r.totalDiscounts || r.totalDiscount || 0);
                            return disc > 0 ? \`-\${disc.toFixed(2)} ر.س\` : '-';
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
                        </td>`;

code = code.replace(/<td className="px-4 py-3 text-left font-medium text-slate-700">[\s\S]*?<\/td>\s*<td className="px-4 py-3 text-left font-bold text-red-600">[\s\S]*?<\/td>\s*<td className="px-4 py-3 text-left font-medium text-blue-700">[\s\S]*?<\/td>\s*<td className="px-4 py-3 text-left font-bold text-amber-700">[\s\S]*?<\/td>\s*<td className="px-4 py-3 text-left font-black text-emerald-700 text-sm">[\s\S]*?<\/td>/, replacement);

const tableHeaderRegex = /<th className="px-4 py-3 font-medium">إجمالي العمولة<\/th>[\s\S]*?<th className="px-4 py-3 font-medium">إجمالي الخصم<\/th>[\s\S]*?<th className="px-4 py-3 font-medium">مدفوع أونلاين<\/th>[\s\S]*?<th className="px-4 py-3 font-medium">الدفع عند الاستلام<\/th>[\s\S]*?<th className="px-4 py-3 font-medium">صافي العمولة<\/th>/;

const newTableHeader = `<th className="px-4 py-3 font-medium">العمولة المستحقة</th>
                <th className="px-4 py-3 font-medium">إجمالي الخصومات</th>
                <th className="px-4 py-3 font-medium">الدفعات والتسويات</th>
                <th className="px-4 py-3 font-medium">المبالغ المطلوبة</th>
                <th className="px-4 py-3 font-medium">صافي المطلوب من المندوب</th>`;

code = code.replace(tableHeaderRegex, newTableHeader);

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
