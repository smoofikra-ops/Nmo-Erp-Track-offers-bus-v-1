const fs = require('fs');

let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

const archiveImport = "import { archiveService } from '@/services/archiveService';";
if (!code.includes('archiveService')) {
  code = code.replace("import { productService } from '@/services/productService';", "import { productService } from '@/services/productService';\n" + archiveImport);
}

const oldMutationRegex = /mutationFn: \(prod: Product\) => productService\.deleteProduct\(prod\.ProductID, companyId\),/g;

const newMutation = `mutationFn: async ({ prod, reason }: { prod: Product, reason: string }) => {
      const userStr = localStorage.getItem('user');
      const adminUser = userStr ? JSON.parse(userStr) : { id: 'admin-1', name: 'Admin', role: 'admin' };
      return archiveService.archiveRecord('PRODUCT', prod, reason, adminUser, companyId);
    },`;

code = code.replace(oldMutationRegex, newMutation);

const oldHandleDelete = `const handleDelete = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('حذف منتج', () => {
      if (window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) {
        deleteProductMutation.mutate(prod);
      }
    });
  };`;

const newHandleDelete = `const handleDelete = (prod: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('أرشفة منتج', () => {
      const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
      if (!reason || reason.trim() === '') {
        alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
        return;
      }
      if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
        deleteProductMutation.mutate({ prod, reason });
      } else {
        alert('تم إلغاء الأرشفة.');
      }
    });
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

fs.writeFileSync('src/pages/Products/index.tsx', code);
