const fs = require('fs');
const code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');
console.log(code.substring(code.indexOf("return (")));
