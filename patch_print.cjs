const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// 1. Add createPortal
if (!code.includes("import { createPortal }")) {
  code = code.replace("import React", "import React from 'react';\nimport { createPortal } from 'react-dom';\n//");
}

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
