const fs = require('fs');

let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// Replace the <style> block completely
const styleRegex = /<style dangerouslySetInnerHTML=\{\{ __html: `[\s\S]*?`\}\} \/>/;

const newStyle = `<style dangerouslySetInnerHTML={{ __html: \`
  @media print {
    body > *:not(#print-portal-root) {
      display: none !important;
    }
    #print-portal-root {
      display: block !important;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      background: white !important;
      margin: 0;
      padding: 0;
    }
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    
    .report-section,
    table,
    tr,
    .summary-card,
    .signature-section {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
\`}} />`;

code = code.replace(styleRegex, newStyle);

// Let's modify the JSX return to separate the modal screen and the print portal
// The current structure is:
// return (
//   <div className="fixed inset-0 z-50 ... print:block">
//      {/* Top Floating Control Bar ... print:hidden */}
//      {/* Printable Sheet Container ... my-8 print:my-0 */}
//        <style ... />
//        <div id="printable-summary-sheet" ...>
//           ... content ...
//        </div>
//      </div>
//   </div>
// );

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
