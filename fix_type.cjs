const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');
code = code.replace(
  "const { data: allRecords = [], isLoading: recordsLoading } = useQuery({",
  "const { data: allRecords = [] as CommissionRecord[], isLoading: recordsLoading } = useQuery<CommissionRecord[]>({"
);

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Fixed type inference for useQuery");
