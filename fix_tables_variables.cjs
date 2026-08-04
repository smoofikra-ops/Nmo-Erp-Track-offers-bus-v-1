const fs = require('fs');

// 1. Fix Products table
let pCode = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');
pCode = pCode.replace(/filtered\.length/g, 'filteredProducts.length');
pCode = pCode.replace(/filtered\.map/g, 'filteredProducts.map');
// We need to add Package import if not there
if (!pCode.includes('Package,')) {
    pCode = pCode.replace("import { Plus, Search, Edit, Trash2, ArrowUpRight, Upload } from 'lucide-react';", "import { Plus, Search, Edit, Trash2, ArrowUpRight, Upload, Package } from 'lucide-react';");
}
pCode = pCode.replace(/onClick=\{\(\) => handleDelete\(p\)\}/g, "onClick={() => setProductToDelete(p)}");
fs.writeFileSync('src/pages/Products/index.tsx', pCode);

// 2. Fix Quotes History table
let qCode = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
qCode = qCode.replace(/filtered\.length/g, 'filteredQuotes.length');
qCode = qCode.replace(/filtered\.map/g, 'filteredQuotes.map');
qCode = qCode.replace(/onClick=\{\(\) => setSelectedQuote\(q\)\}/g, "onClick={() => { setPrintType('customer'); setPrintingQuote(q); }}");
qCode = qCode.replace(/onClick=\{\(e\) => \{ e\.stopPropagation\(\); setSelectedQuote\(q\); \}\}/g, "onClick={(e) => { e.stopPropagation(); setPrintType('customer'); setPrintingQuote(q); }}");
qCode = qCode.replace(/<Eye className="h-4 w-4 ml-1" \/> التفاصيل/g, '<Printer className="h-4 w-4 ml-1" /> طباعة');

qCode = qCode.replace(/onClick=\{\(e\) => \{ e\.stopPropagation\(\); handleDelete\(q\.id\); \}\}/g, "onClick={(e) => { e.stopPropagation(); requireAdminAuth('حذف العرض', () => deleteMutation.mutate(q.id)); }}");

if (!qCode.includes('Eye,')) {
    qCode = qCode.replace("import { Search, Printer, Edit, CheckCircle } from 'lucide-react';", "import { Search, Printer, Edit, CheckCircle, Eye, Trash2 } from 'lucide-react';");
}

fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', qCode);
