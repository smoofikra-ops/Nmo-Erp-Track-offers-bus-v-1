const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

if (!code.includes('Button onClick={handleSyncImages}')) {
  const btnCode = `
        <div className="flex gap-2">
          <Button onClick={handleSyncImages} disabled={isSyncingImages} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <RefreshCw className={cn("w-4 h-4", isSyncingImages && "animate-spin")} />
            مزامنة صور المنتجات
          </Button>
          <Button onClick={() => openEdit({} as Product)}>
            <Plus className="w-4 h-4 ml-2" /> إضافة منتج
          </Button>
        </div>
  `;
  code = code.replace(/<Button onClick=\{\(\) => openEdit\(\{\} as Product\)\}>[\s\S]*?<\/Button>/, btnCode);
  fs.writeFileSync('src/pages/Products/index.tsx', code);
}
