const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

// 1. Add permissions import if missing
if (!code.includes("import { hasPermission }")) {
  code = code.replace("import { useAuth }", "import { useAuth } from '@/contexts/AuthContext';\nimport { hasPermission, RolePermissions } from '@/utils/permissions';\n// import { useAuth }");
}

// 2. Add state for granted access
if (!code.includes("const [financialAccessGranted, setFinancialAccessGranted]")) {
  const stateRegex = /const \[selectedRecordForPrint, setSelectedRecordForPrint\] = useState<CommissionRecord \| null>\(null\);/;
  code = code.replace(stateRegex, "const [selectedRecordForPrint, setSelectedRecordForPrint] = useState<CommissionRecord | null>(null);\n  const [financialAccessGranted, setFinancialAccessGranted] = useState(false);\n  const { requireAdminAuth } = useAdminAuth();");
}

// 3. Add derived visibility boolean
if (!code.includes("const canViewFinancials =")) {
  const userRoleRegex = /const \{ user \} = useAuth\(\);/;
  code = code.replace(userRoleRegex, "const { user } = useAuth();\n  const canViewFinancials = user ? hasPermission(user.role, RolePermissions.CAN_VIEW_FINANCIAL_SUMMARY) || financialAccessGranted : false;");
}

// 4. Wrap financial cards with conditional rendering
// Total Commission, COD Collection

// Card 1: Total Commission (إجمالي العمولات)
// Card 2: إجمالي الطلبات
// Card 3: الدفع عند الاستلام (COD)
// We need to find them and wrap them.

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Patched visibility vars");
