const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/FinancialLists.tsx', 'utf8');

code = code.replace(/الوصف \(اختياري\)/g, "Description (Optional)");
code = code.replace(/المبلغ المحصل/g, "Collected Amount");
code = code.replace(/هذا الحقل للوصف فقط\./g, "This field is for description only.");
code = code.replace(/مثال: فاتورة #1058/g, "Example: Invoice #1058");
code = code.replace(/مثال: 250.00/g, "Example: 250.00 SAR");
code = code.replace(/نوع الدفع/g, "Payment Type");

fs.writeFileSync('src/components/commissions/FinancialLists.tsx', code);
