const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');

code = code.replace(
  "const { requireAdminAuth } = useAdminAuth();\n  const companyId = user?.currentCompanyId || 'COM-0001';",
  "const { requireAdminAuth } = useAdminAuth();\n  const companyId = user?.currentCompanyId || 'COM-0001';\n  const isAdmin = user?.role === 'ADMIN';"
);

fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', code);
