const fs = require('fs');
let pCode = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

pCode = pCode.replace("import { Plus, Search, Edit, Trash2, Save, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';", "import { Plus, Search, Edit, Trash2, Save, Image as ImageIcon, Link as LinkIcon, RefreshCw, Package } from 'lucide-react';");
pCode = pCode.replace(/onClick=\{\(\) => setProductToDelete\(p\)\}/g, "onClick={() => { if (confirm('تأكيد الحذف؟')) deleteMutation.mutate(p); }}");

fs.writeFileSync('src/pages/Products/index.tsx', pCode);
