const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

if (!code.includes('syncResult &&')) {
  const resultUI = `
      {syncResult && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-2">نتيجة مزامنة الصور:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>إجمالي المنتجات في النظام: {syncResult.totalProducts}</li>
            <li>إجمالي الصور في Cloudinary: {syncResult.totalImages}</li>
            <li>عدد المطابقات الناجحة (صور موجودة): {syncResult.matchCount}</li>
            <li>عدد المنتجات التي لم تجد صورة: {syncResult.noMatchCount}</li>
            <li>عدد المنتجات التي تم تحديث رابطها في هذه العملية: {syncResult.updatedCount}</li>
            {syncResult.duplicates && syncResult.duplicates.length > 0 && (
              <li className="text-amber-600">أسماء صور مكررة تحتاج مراجعة: {syncResult.duplicates.join(', ')}</li>
            )}
          </ul>
        </div>
      )}
  `;
  code = code.replace(/<Card>/, resultUI + '\n      <Card>');
  fs.writeFileSync('src/pages/Products/index.tsx', code);
}
