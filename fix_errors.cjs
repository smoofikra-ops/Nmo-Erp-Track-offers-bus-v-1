const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Fix imports
  if (!code.includes('import { RequiredAmountItem')) {
    code = `import { RequiredAmountItem, PaymentItem, DiscountItem } from '@/types/commissions';\nimport { RequiredAmountList, PaymentList, DiscountList } from './components/FinancialLists';\n` + code;
  }
  
  // Fix setTotalRequiredAmount in resetForm
  code = code.replace(/setTotalRequiredAmount\(''\);\s*setOnlinePaidAmount\(''\);\s*setDiscounts\(\[\]\);/g, "setRequiredItems([]);\n    setPaymentItems([]);\n    setDiscountItems([]);");
  
  // Fix discountItems in handleBuildRecord
  code = code.replace(/discountItems: discountItems\.filter\(d => d\.amount > 0\),/g, ""); // Remove the duplicate property, I used `discounts: ...`

  fs.writeFileSync(file, code);
}

fixFile('src/pages/Commissions/OrderCountCommission.tsx');
fixFile('src/pages/Commissions/ProductCommission.tsx');
