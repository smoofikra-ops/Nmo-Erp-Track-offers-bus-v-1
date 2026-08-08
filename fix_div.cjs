const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

code = code.replace("          </div>\n</div>\n          <div className=\"flex justify-between items-end mt-8 text-[11px] border-t pt-4 border-slate-200\">", "          <div className=\"flex justify-between items-end mt-8 text-[11px] border-t pt-4 border-slate-200\">");

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
