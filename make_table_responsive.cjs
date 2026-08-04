const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

// I will just add `.hidden md:table` to the table, and generate a `.md:hidden` block of cards.
const tableBlock = /<table className="w-full text-xs text-right whitespace-nowrap">[\s\S]*?<\/table>/;
const match = code.match(tableBlock);

if (match) {
  const newTable = match[0].replace('<table className="w-full text-xs text-right whitespace-nowrap">', '<table className="w-full text-xs text-right whitespace-nowrap hidden md:table">');
  
  const mobileCards = `
          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100">
            {Object.keys(groupedRecords).length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد سجلات</div>
            ) : (
              Object.entries(groupedRecords).map(([dateStr, records]) => (
                <React.Fragment key={dateStr}>
                  <div className="bg-slate-50/80 px-4 py-2 font-bold text-slate-800 text-[11px] border-y border-slate-200">
                    {dateStr}
                  </div>
                  {records.map(r => (
                    <div key={r.id} className="p-4 space-y-3" onClick={() => setViewRecordModal(r)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-emerald-700">{r.transactionNo}</span>
                          <span className="block text-slate-500 text-[10px] mt-0.5">{r.formattedDate}</span>
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-slate-900 block">{r.employeeName}</span>
                          <span className="text-[10px] text-slate-400 block">{r.employeeCode}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-600">نوع العمولة</span>
                        <span className="font-bold text-emerald-700">{r.commissionType === 'PRODUCT_COMMISSION' ? 'منتجات' : 'طلبات'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg">
                        <span className="text-slate-600">الكمية/الطلبات</span>
                        <span className="font-mono font-bold">{r.quantityOrOrdersCount}</span>
                      </div>
                      
                      {canViewFinancials && (
                        <>
                          <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg border-b border-slate-200">
                            <span className="text-slate-600">إجمالي العمولة</span>
                            <span className="font-bold">{r.grossCommission?.toFixed(2)} ر.س</span>
                          </div>
                          <div className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg border-b border-slate-200">
                            <span className="text-slate-600">المطلوب (COD)</span>
                            <span className="font-bold text-amber-700">{r.codRequiredAmount?.toFixed(2) || '0.00'} ر.س</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center text-sm p-2 bg-emerald-50 rounded-lg">
                        <span className="text-emerald-900 font-bold">صافي العمولة</span>
                        <span className="font-black text-emerald-700">{r.netCommission?.toFixed(2)} ر.س</span>
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button variant="outline" size="sm" className="h-8 text-slate-600 w-full" onClick={(e) => { e.stopPropagation(); setViewRecordModal(r); }}>
                          <Eye className="h-4 w-4 ml-2" /> التفاصيل
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-emerald-600 w-full" onClick={(e) => { e.stopPropagation(); setSelectedRecordForPrint(r); }}>
                          <Printer className="h-4 w-4 ml-2" /> طباعة
                        </Button>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
  `;
  
  code = code.replace(match[0], newTable + "\n" + mobileCards);
  fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
  console.log("Added mobile cards view for the table");
}

