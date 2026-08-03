const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');

code = code.replace(
  "const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);",
  "const [printingQuote, setPrintingQuote] = useState<Quote | null>(null);\n  const [printType, setPrintType] = useState<'customer' | 'management'>('customer');"
);

code = code.replace(
  "<button onClick={() => setPrintingQuote(quote)} className=\"p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded\" title=\"طباعة\">",
  `<button onClick={() => { setPrintType('customer'); setPrintingQuote(quote); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded" title="طباعة العميل">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setPrintType('management'); setPrintingQuote(quote); }} className="p-1.5 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded ml-1" title="طباعة الإدارة (بالتكاليف)">`
);


const printLayoutRegex = /<PrintLayout quote=\{printingQuote\} \/>/;
code = code.replace(printLayoutRegex, "<PrintLayout quote={printingQuote} isManagement={printType === 'management'} />");

const printHeaderRegex = /<Button onClick=\{\(\) => window\.print\(\)\} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">[\s\S]*?طباعة[\s\S]*?<\/Button>/;
code = code.replace(printHeaderRegex, `<Button onClick={() => window.print()} className={printType === 'management' ? "bg-rose-600 hover:bg-rose-700 text-white gap-2" : "bg-indigo-600 hover:bg-indigo-700 text-white gap-2"}>
            <Printer className="w-4 h-4" /> {printType === 'management' ? 'طباعة نسخة الإدارة' : 'طباعة نسخة العميل'}
          </Button>`);


fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', code);
