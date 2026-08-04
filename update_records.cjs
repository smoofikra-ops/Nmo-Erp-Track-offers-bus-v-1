const fs = require('fs');
let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

// We need to import some icons for collapsible
if (!code.includes('ChevronDown')) {
    code = code.replace("import { Search, Eye, Download, Printer, Filter, Calendar, FileSpreadsheet, TrendingUp, DollarSign, CreditCard } from 'lucide-react';", 
    "import { Search, Eye, Download, Printer, Filter, Calendar, FileSpreadsheet, TrendingUp, DollarSign, CreditCard, ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react';");
}

// Add state for collapsible and filter modal
code = code.replace(
  "const [searchTerm, setSearchTerm] = useState('');",
  "const [searchTerm, setSearchTerm] = useState('');\n  const [showMetrics, setShowMetrics] = useState(false);\n  const [showFiltersModal, setShowFiltersModal] = useState(false);"
);

// Metrics Card replace
const metricsGrid = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">([\s\S]*?)<\/div>\s*<Card/m;
const metricsGridMatch = code.match(metricsGrid);

if (metricsGridMatch) {
  const newMetrics = `
      {/* Mobile Metrics Toggle */}
      <div className="md:hidden flex justify-between items-center bg-white p-3 rounded-lg border shadow-sm mb-4" onClick={() => setShowMetrics(!showMetrics)}>
        <span className="font-bold text-sm text-slate-800">ملخص العمولات</span>
        {showMetrics ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
      </div>
      <div className={\`\${showMetrics ? 'block' : 'hidden'} md:block mb-6\`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
${metricsGridMatch[1]}
        </div>
      </div>
      <Card`;
  code = code.replace(metricsGridMatch[0], newMetrics);
}

// Replace filters section
const filterBlockRegex = /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">([\s\S]*?)<\/div>\s*<div className="overflow-hidden">/;
const filterMatch = code.match(filterBlockRegex);

if (filterMatch) {
  const originalFilters = filterMatch[1];
  
  const searchBarMobile = `
          {/* Mobile Search and Filter Button */}
          <div className="flex md:hidden gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="البحث..." className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 pl-3 pr-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-10 p-0 shrink-0" onClick={() => setShowFiltersModal(true)}>
              <SlidersHorizontal className="h-4 w-4 text-slate-600" />
            </Button>
          </div>

          {/* Desktop Filters */}
          <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            ${originalFilters}
          </div>

          {/* Mobile Filters Modal */}
          {showFiltersModal && (
            <div className="fixed inset-0 z-[100] bg-black/50 flex flex-col justify-end md:hidden">
              <div className="bg-white rounded-t-2xl p-4 animate-in slide-in-from-bottom w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">تصفية السجلات</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFiltersModal(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-col gap-3">
                  ${originalFilters.replace(/<div className="relative">/g, '<div className="relative w-full">')}
                  <Button className="w-full mt-2" onClick={() => setShowFiltersModal(false)}>تطبيق</Button>
                </div>
              </div>
            </div>
          )}
  `;
  
  code = code.replace(filterMatch[0], searchBarMobile + '\n          <div className="overflow-hidden">');
}


fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
console.log("Updated records mobile view");
