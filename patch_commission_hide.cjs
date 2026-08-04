const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

// Hide Total COD card
const codCardRegex = /<Card className="bg-blue-50\/50 border-blue-200\/80 shadow-sm">[\s\S]*?<\/Card>/;
const codCardMatch = code.match(codCardRegex);
if (codCardMatch) {
  code = code.replace(codCardMatch[0], `{canViewFinancials && (\n        ${codCardMatch[0]}\n        )}`);
}

// Ensure the user only sees their own records if they are not admin/manager/accountant
// Wait, the user can only see their own commission. 
// Right now `filteredRecords` contains all.
// I will filter `allRecords` inside `const filteredRecords = allRecords.filter(rec => ...`
const filterRegex = /const filteredRecords = allRecords\.filter\(\(rec\) => \{/;
code = code.replace(filterRegex, `const filteredRecords = allRecords.filter((rec) => {\n      // Role-based filtering\n      if (user?.role === 'SALES_REPRESENTATIVE' && rec.employeeCode !== user.id && rec.employeeName !== user.name) return false;`);

// And I also need to add the Reveal button if the user is a restricted user.
// "When a protected user attempts to reveal hidden financial information: Require: Admin Password"
// Where should the button be? Maybe next to the metrics?
const metricsBarRegex = /{canViewFinancials && \([\s\S]*?<Card className="bg-blue-50\/50 border-blue-200\/80 shadow-sm">[\s\S]*?<\/Card>\n        \)}/;

// The table headers
code = code.replace('<th className="px-4 py-3.5 text-left">الخصم</th>', '{canViewFinancials && <th className="px-4 py-3.5 text-left">الخصم</th>}');
code = code.replace('<th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>', '{canViewFinancials && <th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>}');
code = code.replace('<th className="px-4 py-3.5 text-left">الدفع عند الاستلام (COD)</th>', '{canViewFinancials && <th className="px-4 py-3.5 text-left">الدفع عند الاستلام (COD)</th>}');
code = code.replace('<th className="px-4 py-3.5 text-left">المطلوب تحصيله</th>', '{canViewFinancials && <th className="px-4 py-3.5 text-left">المطلوب تحصيله</th>}');

// The table cells
code = code.replace(
  /<td className="px-4 py-3 text-left font-bold text-red-600">[\s\S]*?<\/td>/,
  `{canViewFinancials && (\n                        $& \n                        )}`
);

code = code.replace(
  /<td className="px-4 py-3 text-left font-medium text-blue-700">[\s\S]*?<\/td>/,
  `{canViewFinancials && (\n                        $& \n                        )}`
);

code = code.replace(
  /<td className="px-4 py-3 text-left font-bold text-amber-700">\s*\{r\.codRequiredAmount[\s\S]*?<\/td>/,
  `{canViewFinancials && (\n                        $& \n                        )}`
);

code = code.replace(
  /<td className="px-4 py-3 text-left font-bold text-amber-700">\s*\{\(\(\) => \{[\s\S]*?req\.toFixed\(2\)\s*\+\s*' ر\.س';\s*\}\)\(\)\}\s*<\/td>/,
  `{canViewFinancials && (\n                        $& \n                        )}`
);


// The Modal Financial Summary Breakdown
const modalBreakdownRegex = /{?\/\* Financial Summary Breakdown \*\/}?[\s\S]*?<div className="space-y-2">[\s\S]*?<h4 className="text-xs font-bold text-slate-700">الملخص المالي التفصيلي:<\/h4>[\s\S]*?<div className="rounded-xl border border-slate-200 overflow-hidden text-xs">[\s\S]*?<\/div>[\s\S]*?<\/div>/;
const modalBreakdownMatch = code.match(modalBreakdownRegex);
if (modalBreakdownMatch) {
  code = code.replace(modalBreakdownMatch[0], `{canViewFinancials && (\n            ${modalBreakdownMatch[0]}\n            )}`);
}

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Patched table headers and cells");
