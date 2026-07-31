const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/PrintLayout.tsx', 'utf8');

if (!code.includes('@media print')) {
  code = code.replace(
    /return \(/,
    `return (
    <>
      <style>{` + 
        "\\n@media print {\\n" +
        "  body * { visibility: hidden; }\\n" +
        "  #quote-print-area, #quote-print-area * { visibility: visible; }\\n" +
        "  #quote-print-area { position: absolute; left: 0; top: 0; width: 100%; }\\n" +
        "  tr { page-break-inside: avoid; }\\n" +
        "  .no-print { display: none !important; }\\n" +
        "}\\n" +
      `}</style>`
  );
  fs.writeFileSync('src/pages/Quotes/PrintLayout.tsx', code);
}
