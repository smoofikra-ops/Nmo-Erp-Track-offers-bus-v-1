const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/ProductCommission.tsx', 'utf8');
code = code.replace(
  'const canProceedToSummary = selectedEmployeeId && totalProductsCount > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0;',
  'const canProceedToSummary = selectedEmployeeId && totalProductsCount > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0 && !paymentItems.some(i => /^\\d/.test(i.description || \'\'));'
);
fs.writeFileSync('src/pages/Commissions/ProductCommission.tsx', code);
