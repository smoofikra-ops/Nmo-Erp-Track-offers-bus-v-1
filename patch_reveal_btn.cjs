const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

const metricsBarGrid = '<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">';
if (code.includes(metricsBarGrid)) {
  code = code.replace(metricsBarGrid, `{!canViewFinancials && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => requireAdminAuth('كشف البيانات المالية', () => setFinancialAccessGranted(true))}
            className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 gap-2"
            variant="outline"
          >
            <Lock className="h-4 w-4" />
            <span>كشف البيانات المالية (يتطلب صلاحية الإدارة)</span>
          </Button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">`);
} else {
  console.log("Could not find metrics bar grid");
}

if (!code.includes("import { Lock")) {
  code = code.replace("import { Eye, Plus,", "import { Eye, Plus, Lock,");
}

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Patched reveal button");
