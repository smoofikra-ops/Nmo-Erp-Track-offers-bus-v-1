const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

if (!code.includes('SYNC_PRODUCT_IMAGES')) {
  // Insert import for ApiClient if needed
  if (!code.includes("import { ApiClient }")) {
    code = code.replace(/import { productService } from '@\/services\/productService';/, "import { productService } from '@/services/productService';\nimport { ApiClient } from '@/services/apiClient';");
  }

  // Insert state for syncing
  code = code.replace(/const \[isSaving, setIsSaving\] = useState\(false\);/, "const [isSaving, setIsSaving] = useState(false);\n  const [isSyncingImages, setIsSyncingImages] = useState(false);\n  const [syncResult, setSyncResult] = useState<any>(null);");

  // Insert sync function
  const syncFunc = `
  const handleSyncImages = async () => {
    if (!confirm('هل أنت متأكد من بدء مزامنة صور المنتجات مع Cloudinary؟ قد تستغرق هذه العملية بعض الوقت.')) return;
    setIsSyncingImages(true);
    setSyncResult(null);
    try {
      const response = await ApiClient.post('SYNC_PRODUCT_IMAGES', { companyId });
      if (response.success) {
        setSyncResult(response.data);
        alert('تمت المزامنة بنجاح! يتم الآن إعادة تحميل المنتجات.');
        refetch();
      } else {
        alert('فشل المزامنة: ' + response.message);
      }
    } catch (e) {
      alert('حدث خطأ أثناء المزامنة.');
    } finally {
      setIsSyncingImages(false);
    }
  };
  `;
  code = code.replace(/const handleSave = \(\) => \{/, syncFunc + '\n  const handleSave = () => {');

  // Insert button in UI
  const buttonCode = `
          <Button onClick={handleSyncImages} disabled={isSyncingImages} className="bg-green-600 hover:bg-green-700 text-white">
            {isSyncingImages ? 'جاري المزامنة...' : 'مزامنة صور المنتجات'}
          </Button>
          <Button onClick={handleOpenDialog}>
  `;
  code = code.replace(/<Button onClick=\{handleOpenDialog\}>/, buttonCode);
  
  // Insert sync result display somewhere, e.g. above the table
  const resultUI = `
      {syncResult && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 p-4 rounded-lg mb-6 shadow-sm">
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
  code = code.replace(/<Card className="overflow-hidden shadow-sm">/, resultUI + '\n      <Card className="overflow-hidden shadow-sm">');
  
  fs.writeFileSync('src/pages/Products/index.tsx', code);
}
