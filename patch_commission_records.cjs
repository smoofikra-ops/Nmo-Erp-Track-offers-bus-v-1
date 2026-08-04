const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

// Add COD header right after "المدفوع أونلاين"
code = code.replace(
  '<th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>',
  '<th className="px-4 py-3.5 text-left">المدفوع أونلاين</th>\n                <th className="px-4 py-3.5 text-left">الدفع عند الاستلام (COD)</th>'
);

// Add COD cell
const cellRegex = /<td className="px-4 py-3 text-left font-medium text-blue-700">[\s\S]*?<\/td>/;
const cellMatch = code.match(cellRegex);
if (cellMatch) {
  const newCell = `${cellMatch[0]}
                        <td className="px-4 py-3 text-left font-bold text-amber-700">
                          {r.codRequiredAmount ? r.codRequiredAmount.toFixed(2) + ' ر.س' : '0.00 ر.س'}
                        </td>`;
  code = code.replace(cellMatch[0], newCell);
} else {
  console.log("Could not find cell to insert COD");
}

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Patched CommissionRecords.tsx");
