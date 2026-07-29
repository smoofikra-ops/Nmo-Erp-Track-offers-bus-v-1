const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

code = code.replace(/const finalImageUrl = imageUrl \|\| getProductImageUrl\(sku\);/g, 'const finalImageUrl = imageUrl || "";');

fs.writeFileSync('src/pages/Products/index.tsx', code);
