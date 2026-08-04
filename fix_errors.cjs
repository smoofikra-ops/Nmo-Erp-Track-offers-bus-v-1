const fs = require('fs');

// Fix Products Table
let pCode = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');
pCode = pCode.replace(/onClick=\{\(\) => setProductToDelete\(p\)\}/g, "onClick={() => { if (confirm('تأكيد الحذف؟')) deleteMutation.mutate(p); }}");
fs.writeFileSync('src/pages/Products/index.tsx', pCode);

// Fix Quotes History Table
let qCode = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
// Fix property names
qCode = qCode.replace(/finalTotal/g, 'grandTotal'); // Let's check Quote type in a moment... Wait, let's just use what's in the actual mapping
qCode = qCode.replace(/totalProfit/g, 'totalProfit'); // Wait, let's look at the mapping for Desktop: q.grandTotal and q.totalProfit ? 
