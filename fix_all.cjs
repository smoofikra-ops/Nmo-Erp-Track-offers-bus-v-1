const fs = require('fs');

// 1. Fix PrintableCommissionSummary
let pCode = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

pCode = pCode.replace(/record\.details && record\.details\.length > 0/g, 'record.items && record.items.length > 0');
pCode = pCode.replace(/record\.details\.map/g, 'record.items.map');
pCode = pCode.replace(/d\.name/g, 'd.productName');
pCode = pCode.replace(/d\.commissionRate/g, 'd.unitCommission');
pCode = pCode.replace(/d\.commissionAmount/g, 'd.totalCommission');
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', pCode);


// 2. Fix CommissionRecords
let cCode = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');
cCode = cCode.replace(/import \{ collection, getDocs, deleteDoc, doc \} from 'firebase\/firestore';/, '');
cCode = cCode.replace(/import \{ db \} from '@\/lib\/firebase';/, '');
cCode = cCode.replace(/import \{ Input \} from '@\/components\/ui\/input';/, '');

if (!cCode.includes("import { commissionService }")) {
  cCode = cCode.replace(
    "import { CommissionRecord } from '@/types/commissions';",
    "import { CommissionRecord } from '@/types/commissions';\nimport { commissionService } from '@/services/commissionService';"
  );
}

// Replace Input with standard input
cCode = cCode.replace(
  /<Input\s*type="text"\s*placeholder="البحث برقم العملية، المندوب\.\.\."\s*className="pl-3 pr-10"/g,
  '<input type="text" placeholder="البحث برقم العملية، المندوب..." className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 pl-3 pr-10"'
);

const fetchRegex = /queryFn: async \(\) => \{[\s\S]*?return recordsList;\n    \},/;
cCode = cCode.replace(fetchRegex, `queryFn: async () => {
      const records = await commissionService.getCommissionHistory('COM-0001'); // Assuming mock companyId
      return records;
    },`);

const deleteRegex = /mutationFn: async \(recordId: string\) => \{[\s\S]*?\},/;
cCode = cCode.replace(deleteRegex, `mutationFn: async (recordId: string) => {
      await commissionService.deleteCommissionRecord(recordId, 'COM-0001');
    },`);

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', cCode);
