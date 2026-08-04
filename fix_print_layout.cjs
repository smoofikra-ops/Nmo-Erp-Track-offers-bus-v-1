const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// We will use regex to extract the contents of <div id="printable-summary-sheet"...>
const contentRegex = /<div id="printable-summary-sheet" className="[^"]*"(?: dir="rtl")?>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\);/m;
const match = code.match(contentRegex);

if (match) {
  const content = match[1];
  
  // We'll wrap the return statement entirely
  const beforeReturn = code.substring(0, code.indexOf("  return ("));
  
  const newReturn = `
  const printContent = (
    <div id="printable-summary-sheet" className="p-4 sm:p-6 font-sans text-right bg-white text-slate-900 w-full mx-auto" dir="rtl">
      ${content}
    </div>
  );

  return (
    <>
      {/* On-screen Modal View */}
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:hidden">
        {/* Top Floating Control Bar */}
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 p-2 rounded-xl shadow-lg">
          <Button onClick={handlePrint} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Printer className="h-4 w-4" />
            <span>طباعة الملخص (A4)</span>
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="icon" className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Modal Sheet Container */}
        <div className="bg-white text-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden border border-slate-200 my-8">
          {printContent}
        </div>
      </div>
      
      {/* Print Portal */}
      {createPortal(
        <div id="print-portal-root" className="hidden print:block w-full">
          <style dangerouslySetInnerHTML={{ __html: \`
            @media print {
              body > *:not(#print-portal-root) {
                display: none !important;
              }
              #print-portal-root {
                display: block !important;
                width: 100%;
                background: white !important;
                margin: 0;
                padding: 0;
              }
              @page {
                size: A4 portrait;
                margin: 8mm;
              }
              .report-section, table, tr, .summary-card, .signature-section {
                break-inside: avoid;
                page-break-inside: avoid;
              }
              #printable-summary-sheet {
                padding: 0 !important;
                box-shadow: none !important;
              }
            }
          \`}} />
          {printContent}
        </div>,
        document.body
      )}
    </>
  );
}
`;

  fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', beforeReturn + newReturn);
  console.log("Successfully replaced return block.");
} else {
  console.log("Regex didn't match.");
}
