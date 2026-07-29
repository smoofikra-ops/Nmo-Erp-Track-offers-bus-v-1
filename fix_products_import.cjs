const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');
code = code.replace(/import \{ Plus, Search, Edit, Trash2, Save, Image as ImageIcon, Link as LinkIcon \} from 'lucide-react';/, "import { Plus, Search, Edit, Trash2, Save, Image as ImageIcon, Link as LinkIcon, RefreshCw } from 'lucide-react';");
fs.writeFileSync('src/pages/Products/index.tsx', code);
