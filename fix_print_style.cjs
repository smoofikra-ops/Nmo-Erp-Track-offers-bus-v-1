const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

const oldStyle = `        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }`;
          
const newStyle = `        @media print {
          #root { display: none !important; }
          .fixed.inset-0 { position: relative !important; }
          @page {
            size: A4 portrait;
            margin: 0;
          }`;

code = code.replace(oldStyle, newStyle);
fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
