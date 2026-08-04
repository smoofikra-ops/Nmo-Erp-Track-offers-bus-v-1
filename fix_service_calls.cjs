const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

code = code.replace(/await commissionService\.getCommissionHistory\('COM-0001'\)/g, "await commissionService.getCommissionRecords('COM-0001')");
code = code.replace(/await commissionService\.deleteCommissionRecord\(recordId, 'COM-0001'\)/g, "await commissionService.deleteCommissionRecord(recordId)");
code = code.replace(/JSON\.parse\(s\)/g, "JSON.parse(s as string)");

// wait, getCommissionRecords returns { data: CommissionRecord[], success: boolean, message?: string } because it's an ApiResponse
// Let's modify the queryFn to return records.data || []
code = code.replace(/const records = await commissionService\.getCommissionRecords\('COM-0001'\);\s*return records;/, "const response = await commissionService.getCommissionRecords('COM-0001');\n      return (response.data || []) as CommissionRecord[];");

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Fixed service calls");
