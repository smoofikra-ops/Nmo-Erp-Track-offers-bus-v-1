const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// 1. Remove old Comprehensive Financial Summary table completely.
// We will replace it with the new layout starting below the Order/Product commission details.
// To do this reliably, we'll locate the start of "Discounts Breakdown" and replace from there to the Notes section.
const regex = /{\/\* Discounts Breakdown.*?{\/\* Notes Section \*\//s;

const newLayout = `
          {/* Required Amounts */}
          {record.requiredItems && record.requiredItems.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل المبالغ المطلوبة</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">الوصف</th>
                      <th className="p-2.5 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.requiredItems.map((item, idx) => (
                      <tr key={item.id || idx} className="bg-white">
                        <td className="p-2.5 font-medium text-slate-800">{item.description}</td>
                        <td className="p-2.5 text-left font-bold text-slate-700">{Number(item.amount).toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5 text-slate-900">إجمالي المبالغ المطلوبة</td>
                      <td className="p-2.5 text-left text-slate-900">
                        {record.requiredItems.reduce((s, i) => s + Number(i.amount), 0).toFixed(2)} ر.س
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            record.totalRequiredAmount !== undefined && (
               <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل المبالغ المطلوبة</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex justify-between font-bold text-sm">
                     <span>إجمالي المبلغ المطلوب</span>
                     <span>{(record.totalRequiredAmount || record.totalOrderValue || 0).toFixed(2)} ر.س</span>
                  </div>
               </div>
            )
          )}

          {/* Payments & Settlements */}
          {record.paymentItems && record.paymentItems.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل الدفعات والتسويات</h3>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-xs text-right border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">نوع الدفع</th>
                      <th className="p-2.5">الوصف</th>
                      <th className="p-2.5 text-left">المبلغ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {record.paymentItems.map((item, idx) => (
                      <tr key={item.id || idx} className="bg-white">
                        <td className="p-2.5 font-medium text-slate-800">{item.method}</td>
                        <td className="p-2.5 text-slate-600">{item.description || '-'}</td>
                        <td className="p-2.5 text-left font-bold text-blue-700">{Number(item.amount).toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td colSpan={2} className="p-2.5 text-slate-900">إجمالي الدفعات والتسويات</td>
                      <td className="p-2.5 text-left text-blue-700">
                        {record.paymentItems.reduce((s, i) => s + Number(i.amount), 0).toFixed(2)} ر.س
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
             record.onlinePaidAmount !== undefined && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">تفاصيل الدفعات والتسويات</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 p-2.5 bg-slate-50 flex justify-between font-bold text-sm">
                     <span>إجمالي المدفوع</span>
                     <span className="text-blue-700">{(record.onlinePaidAmount || 0).toFixed(2)} ر.س</span>
                  </div>
               </div>
             )
          )}

          {/* Discounts */}
          {(record.discounts && record.discounts.length > 0) && (
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
                    {record.discounts.map((d: any, idx: number) => (
                      <tr key={idx} className="bg-white">
                        <td className="p-2.5 font-medium text-slate-800">{d.name || d.description}</td>
                        <td className="p-2.5 text-left font-bold text-red-600">{Number(d.amount).toFixed(2)} ر.س</td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold">
                      <td className="p-2.5 text-slate-900">إجمالي الخصومات</td>
                      <td className="p-2.5 text-left text-red-600">
                        {record.discounts.reduce((s, d) => s + Number(d.amount), 0).toFixed(2)} ر.س
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Financial Summary Table */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">الملخص المالي النهائي والتسوية</h3>
            <div className="rounded-xl border border-slate-300 overflow-hidden">
              <table className="w-full text-sm border-collapse">
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-3 font-medium text-slate-600">إجمالي المبالغ المطلوبة</td>
                    <td className="p-3 font-bold text-slate-900 text-left">
                      {(record.requiredItems ? record.requiredItems.reduce((s, i) => s + Number(i.amount), 0) : (record.totalRequiredAmount || record.totalOrderValue || 0)).toFixed(2)} ر.س
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 font-medium text-slate-600">ناقص إجمالي الدفعات والتسويات</td>
                    <td className="p-3 font-bold text-blue-700 text-left">
                      -{(record.paymentItems ? record.paymentItems.reduce((s, i) => s + Number(i.amount), 0) : (record.onlinePaidAmount || 0)).toFixed(2)} ر.س
                    </td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-3 font-medium text-slate-600">ناقص إجمالي الخصومات</td>
                    <td className="p-3 font-bold text-red-600 text-left">
                      -{(record.discounts ? record.discounts.reduce((s, d) => s + Number(d.amount), 0) : (record.totalDiscounts || record.totalDiscount || 0)).toFixed(2)} ر.س
                    </td>
                  </tr>
                  
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-3 text-slate-700">يساوي المبلغ قبل خصم العمولة</td>
                    <td className="p-3 text-left text-slate-800">
                      {((record.requiredItems ? record.requiredItems.reduce((s, i) => s + Number(i.amount), 0) : (record.totalRequiredAmount || record.totalOrderValue || 0)) -
                        (record.paymentItems ? record.paymentItems.reduce((s, i) => s + Number(i.amount), 0) : (record.onlinePaidAmount || 0)) -
                        (record.discounts ? record.discounts.reduce((s, d) => s + Number(d.amount), 0) : (record.totalDiscounts || record.totalDiscount || 0))).toFixed(2)} ر.س
                    </td>
                  </tr>
                  
                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <td className="p-3">ناقص إجمالي عمولة المندوب المستحقة</td>
                    <td className="p-3 text-left font-extrabold text-base text-emerald-700">
                      -{record.grossCommission.toFixed(2)} ر.س
                    </td>
                  </tr>
                  
                  <tr className="bg-slate-100 font-bold text-sm">
                    <td className="p-3 text-slate-900">صافي المبلغ النهائي المطلوب من المندوب</td>
                    <td className="p-3 text-left font-black text-slate-900">
                      {record.finalRequiredAmount !== undefined ? record.finalRequiredAmount.toFixed(2) : ((record.totalRequiredAmount || record.totalOrderValue || 0) - (record.onlinePaidAmount || 0) - (record.totalDiscounts || record.totalDiscount || 0) - record.grossCommission).toFixed(2)} ر.س
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes Section */`;

code = code.replace(regex, newLayout);
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
