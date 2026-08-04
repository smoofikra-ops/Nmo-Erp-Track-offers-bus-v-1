const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

const tableBlock = /<table className="w-full text-sm text-right whitespace-nowrap">[\s\S]*?<\/table>/;
const match = code.match(tableBlock);

if (match) {
  const newTable = match[0].replace('<table className="w-full text-sm text-right whitespace-nowrap">', '<table className="w-full text-sm text-right whitespace-nowrap hidden md:table">');
  
  const mobileCards = `
          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            ) : (
              filtered.map((p, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-lg p-4 mb-3 space-y-3 shadow-sm">
                  <div className="flex gap-3 items-start border-b pb-3">
                    {p.ImageURL ? (
                      <img src={p.ImageURL} alt={p.ArabicName} className="w-12 h-12 rounded bg-slate-50 object-cover border" />
                    ) : (
                      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 border">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                      <span className="font-bold text-slate-900 block truncate">{p.ArabicName || p.EnglishName}</span>
                      <span className="text-xs text-slate-500 font-mono mt-0.5">{p.SKU}</span>
                    </div>
                    <span className={\`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 \${
                        p.Status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                      }\`}>
                        {p.Status === 'ACTIVE' ? 'نشط' : 'غير نشط'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-500 block mb-1">سعر الشراء</span>
                      <span className="font-bold">{Number(p.PurchaseCostIncVAT || 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-500 block mb-1">سعر البيع</span>
                      <span className="font-bold text-indigo-600">{Number(p.SellingPriceIncVAT || 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-500 block mb-1">الربح</span>
                      <span className="font-bold text-emerald-600">{Number(p.ProfitAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded">
                      <span className="text-slate-500 block mb-1">نسبة الربح</span>
                      <span className="font-bold text-blue-600">{Number((p.ProfitMargin || 0) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">الكمية المتوفرة:</span>
                    <span className="font-bold bg-slate-100 px-2 py-1 rounded">{p.AvailableQuantity || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">العمولة الافتراضية:</span>
                    <span className="font-bold text-emerald-700">{p.DefaultCommission}%</span>
                  </div>
                  
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 text-indigo-600">
                      <Edit className="h-4 w-4 ml-1" /> تعديل
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p)} className="h-8 text-red-600">
                      <Trash2 className="h-4 w-4 ml-1" /> حذف
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
  `;
  
  code = code.replace(match[0], newTable + "\n" + mobileCards);
  fs.writeFileSync('src/pages/Products/index.tsx', code);
  console.log("Added mobile cards view for the Products table");
}

