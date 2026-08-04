const fs = require('fs');

let qCode = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');

const regex = /<\/table>[\s\S]*?<\/CardContent>/;

const newMobileCards = `</table>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filteredQuotes.length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد عروض سعر</div>
            ) : (
              filteredQuotes.map((q) => (
                <div key={q.id} className="bg-white border border-slate-100 rounded-lg p-4 mb-3 space-y-3 shadow-sm" onClick={() => { setPrintType('customer'); setPrintingQuote(q); }}>
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">{q.title || 'عرض سعر'}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">{q.quoteNumber || q.id.slice(-6)}</span>
                    </div>
                    <span className={\`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 \${getStatusColor(q.status)}\`}>
                      {getStatusText(q.status)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">العميل:</span>
                    <span className="font-medium text-slate-800">{q.customerName || 'بدون عميل'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">التاريخ:</span>
                    <span className="font-medium text-slate-800">{new Date(q.createdAt || Date.now()).toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                    <span className="font-bold text-slate-800">القيمة النهائية:</span>
                    <span className="font-black text-indigo-600">{Number(q.totals?.finalQuotePriceIncVat || 0).toFixed(2)} ر.س</span>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex justify-between items-center text-xs bg-emerald-50 p-2 rounded">
                      <span className="font-bold text-emerald-800">إجمالي الربح:</span>
                      <span className="font-black text-emerald-600">{Number(q.totals?.netProfit || 0).toFixed(2)} ر.س</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                     <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPrintType('customer'); setPrintingQuote(q); }} className="h-8 text-indigo-600">
                       <Printer className="h-4 w-4 ml-1" /> طباعة العميل
                     </Button>
                     {isAdmin && (
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setPrintType('management'); setPrintingQuote(q); }} className="h-8 text-rose-600">
                         <Printer className="h-4 w-4 ml-1" /> طباعة الإدارة
                       </Button>
                     )}
                     {q.status === 'draft' && (
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); requireAdminAuth('تعديل عرض سعر', () => onEditQuote(q)); }} className="h-8 text-emerald-600">
                         <FileEdit className="h-4 w-4 ml-1" /> تعديل
                       </Button>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>`;

qCode = qCode.replace(regex, newMobileCards);

fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', qCode);
