const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

const queryFnOld = /queryFn: async \(\) => \{\s*const records = await commissionService\.getCommissionRecords\('COM-0001'\); \/\/ Assuming mock companyId\s*return records;\s*\}/;
const queryFnNew = `queryFn: async () => {
      const response = await commissionService.getCommissionRecords('COM-0001');
      return (response.data || []) as CommissionRecord[];
    }`;

code = code.replace(queryFnOld, queryFnNew);
fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Fixed queryFn");
