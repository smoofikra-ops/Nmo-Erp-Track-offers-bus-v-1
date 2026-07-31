const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/PrintLayout.tsx', 'utf8');

code = code.replace(
  /<style>\{[^}]+\}<\/style>/,
  `{/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: \`
        @media print {
          body * { visibility: hidden; }
          #quote-print-area, #quote-print-area * { visibility: visible; }
          #quote-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          tr { page-break-inside: avoid; }
          .no-print { display: none !important; }
        }
      \`}} />`
);
fs.writeFileSync('src/pages/Quotes/PrintLayout.tsx', code);
