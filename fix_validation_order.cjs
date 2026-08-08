const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/OrderCountCommission.tsx', 'utf8');
code = code.replace(
  'const canProceedToSummary = selectedEmployeeId && newOrdersNum > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0;',
  'const canProceedToSummary = selectedEmployeeId && newOrdersNum > 0 && numTotalRequired >= 0 && numOnlinePaid >= 0 && !paymentItems.some(i => /^\\d/.test(i.description || \'\'));'
);
fs.writeFileSync('src/pages/Commissions/OrderCountCommission.tsx', code);
