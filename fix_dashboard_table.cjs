const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const tableBlock = /<table className="w-full text-sm text-right">[\s\S]*?<\/table>/;
const match = code.match(tableBlock);

if (match) {
  const newTable = match[0].replace('<table className="w-full text-sm text-right">', '<table className="w-full text-sm text-right hidden md:table">');
  
  const mobileCards = `
          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-slate-100 p-2">
            {agentStatsList.length === 0 ? (
              <div className="p-8 text-center text-slate-500">لا توجد بيانات</div>
            ) : (
              agentStatsList.map((agent, i) => (
                <div key={i} className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-3 space-y-3 shadow-sm">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-bold text-slate-900 text-lg">{agent.name}</span>
                    <span className="font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{agent.commission.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">المطلوب تحصيله:</span>
                    <span className="font-medium text-slate-800">{agent.required.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">تم تحصيله (تسويات):</span>
                    <span className="font-medium text-emerald-600">{agent.collected.toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-800">المتبقي للتحصيل:</span>
                    <span className={\`font-black \${agent.remaining > 0 ? 'text-rose-600' : 'text-emerald-500'}\`}>
                      {agent.remaining.toFixed(2)} ر.س
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
  `;
  
  code = code.replace(match[0], newTable + "\n" + mobileCards);
  fs.writeFileSync('src/pages/Dashboard.tsx', code);
  console.log("Added mobile cards view for the Dashboard table");
}

