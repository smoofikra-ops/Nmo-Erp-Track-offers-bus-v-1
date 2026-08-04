const fs = require('fs');
let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

const tableBlock = /<table className="w-full text-sm text-left">[\s\S]*?<\/table>/;
const match = code.match(tableBlock);

if (match) {
  const newTable = match[0].replace('<table className="w-full text-sm text-left">', '<table className="w-full text-sm text-left hidden md:table">');
  
  const mobileCards = `
          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            ) : (
              filtered.map((e, i) => {
                const isDeleted = e.IsDeleted === true || (e.IsDeleted as any) === 'TRUE' || (e.IsDeleted as any) === 'true';
                return (
                  <div key={i} className={\`bg-white border \${isDeleted ? 'border-red-200 bg-red-50' : 'border-slate-100'} rounded-lg p-4 mb-3 space-y-3 shadow-sm\`}>
                    <div className="flex justify-between items-start border-b pb-2">
                      <div>
                        <span className="font-bold text-slate-900 block">{e.ArabicName || e.EnglishName}</span>
                        <span className="text-xs text-slate-500 font-mono mt-0.5">{e.EmployeeCode}</span>
                      </div>
                      <span className={\`text-xs px-2 py-1 rounded-full font-medium \${
                        e.Status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        e.Status === 'INACTIVE' ? 'bg-slate-100 text-slate-800' :
                        'bg-rose-100 text-rose-800'
                      }\`}>
                        {e.Status === 'ACTIVE' ? t('employees.statusActive', 'Active') : e.Status === 'INACTIVE' ? t('employees.statusInactive', 'Inactive') : t('employees.statusSuspended', 'Suspended')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{t('employees.mobile', 'Mobile')}:</span>
                      <span className="font-medium text-slate-800" dir="ltr">{e.Mobile}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">{t('employees.commissionType', 'Commission')}:</span>
                      <span className="font-medium text-indigo-600">{getCommissionTypeLabel(e.CommissionType)}</span>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      {isDeleted ? (
                         isAdmin && (
                           <Button variant="outline" size="sm" onClick={() => handleRestore(e)} className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                             <RotateCcw className="h-4 w-4 mr-1 ml-1" /> {t('common.restore', 'Restore')}
                           </Button>
                         )
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(e)} className="h-8 text-indigo-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(e)} className="h-8 text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
  `;
  
  code = code.replace(match[0], newTable + "\n" + mobileCards);
  fs.writeFileSync('src/pages/Employees/index.tsx', code);
  console.log("Added mobile cards view for the Employees table");
}

