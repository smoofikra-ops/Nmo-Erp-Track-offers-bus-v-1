const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

code = code.replace(
  /<div className="bg-white mx-auto min-h-screen print:min-h-0 relative flex flex-col justify-between" style=\{\{ width: '210mm', minHeight: '297mm', padding: '15mm' \}\}>/g,
  '<div className="bg-white mx-auto w-full max-w-3xl min-h-screen print:min-h-0 relative flex flex-col justify-between p-4 sm:p-8 print:p-8" id="printable-area">'
);

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
console.log("Fixed PrintableCommissionSummary width");
