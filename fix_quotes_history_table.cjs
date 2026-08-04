const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');

const tableBlock = /<table className="w-full text-sm text-right whitespace-nowrap">[\s\S]*?<\/table>/;
const match = code.match(tableBlock);

if (match) {
  const newTable = match[0].replace('<table className="w-full text-sm text-right whitespace-nowrap">', '<table className="w-full text-sm text-right whitespace-nowrap hidden md:table">');
  
  const mobileCards = `
          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد عروض سعر</div>
            ) : (
              filtered.map((q) => (
                <div key={q.id} className="bg-white border border-slate-100 rounded-lg p-4 mb-3 space-y-3 shadow-sm" onClick={() => setSelectedQuote(q)}>
                  <div className="flex justify-between items-start border-b pb-2">
                    <div>
                      <span className="font-bold text-slate-900 block truncate max-w-[200px]">{q.title || 'عرض سعر'}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">{q.quoteNumber}</span>
                    </div>
                    <span className={\`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 \${
                      q.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      q.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      q.status === 'EXPIRED' ? 'bg-slate-100 text-slate-800' :
                      'bg-amber-100 text-amber-800'
                    }\`}>
                      {q.status === 'APPROVED' ? 'مقبول' : q.status === 'REJECTED' ? 'مرفوض' : q.status === 'EXPIRED' ? 'منتهي' : 'مسودة'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">العميل:</span>
                    <span className="font-medium text-slate-800">{q.customerName || 'غير محدد'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">التاريخ:</span>
                    <span className="font-medium text-slate-800">{q.createdAt ? q.createdAt.split('T')[0] : ''}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                    <span className="font-bold text-slate-800">القيمة النهائية:</span>
                    <span className="font-black text-indigo-600">{Number(q.finalTotal || 0).toFixed(2)} ر.س</span>
                  </div>
                  
                  {isAdmin && (
                    <div className="flex justify-between items-center text-xs bg-emerald-50 p-2 rounded">
                      <span className="font-bold text-emerald-800">إجمالي الربح:</span>
                      <span className="font-black text-emerald-600">{Number(q.totalProfit || 0).toFixed(2)} ر.س</span>
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                     <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedQuote(q); }} className="h-8 text-indigo-600">
                       <Eye className="h-4 w-4 ml-1" /> التفاصيل
                     </Button>
                     {isAdmin && (
                       <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(q.id); }} className="h-8 text-red-600">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
  `;
  
  code = code.replace(match[0], newTable + "\n" + mobileCards);
  fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', code);
  console.log("Added mobile cards view for Quotes History table");
}

