const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

const openEditRegex = /const openEdit = \(p: Product\) => \{[\s\S]*?if \(!p\.ProductID\) \{[\s\S]*?setSku\(''\);/;

const replacement = `const openEdit = (p: Product) => {
    // If it's a new product, no admin auth required.
    if (!p.ProductID) {
      setEditingProduct(p);
      
      // Auto-generate SKU
      let maxNum = 0;
      const allProds = products || [];
      allProds.forEach(prod => {
        const match = prod.SKU?.match(/PRD-\\d{4}-(\\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const year = new Date().getFullYear();
      const nextNumStr = String(maxNum + 1).padStart(6, '0');
      const newSku = \`PRD-\${year}-\${nextNumStr}\`;
      
      setSku(newSku);`;

code = code.replace(openEditRegex, replacement);

// Make the SKU field disabled/read-only
const skuFieldRegex = /<label className="text-sm font-medium">رمز المنتج \(SKU\)\*<\/label>\s*<input\s*type="text"\s*value=\{sku\}\s*onChange=\{\(e\) => setSku\(e\.target\.value\)\}/;

code = code.replace(skuFieldRegex, `<label className="text-sm font-medium">رمز المنتج (SKU)*</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  disabled
                  className="bg-slate-100 opacity-80"`);

fs.writeFileSync('src/pages/Products/index.tsx', code);
console.log("Patched SKU generation");
