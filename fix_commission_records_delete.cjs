const fs = require('fs');

let code = fs.readFileSync('src/pages/Commissions/CommissionRecords.tsx', 'utf8');

const archiveImport = "import { archiveService } from '@/services/archiveService';";
if (!code.includes('archiveService')) {
  code = code.replace("import { commissionService } from '@/services/commissionService';", "import { commissionService } from '@/services/commissionService';\n" + archiveImport);
}

// Find deleteRecordMutation and replace it with archive mutation
const oldMutationRegex = /const deleteRecordMutation = useMutation\(\{\s*mutationFn: async \(recordId: string\) => \{\s*await commissionService.deleteCommissionRecord\(recordId\);\s*\},/g;

const newMutation = `const deleteRecordMutation = useMutation({
    mutationFn: async ({ record, reason }: { record: any, reason: string }) => {
      const userStr = localStorage.getItem('user');
      const adminUser = userStr ? JSON.parse(userStr) : { id: 'admin-1', name: 'Admin', role: 'admin' };
      await archiveService.archiveRecord('COMMISSION_RECORD', record, reason, adminUser, 'COM-0001');
    },`;

code = code.replace(oldMutationRegex, newMutation);

// Update handleDelete
const oldHandleDelete = `const handleDelete = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('حذف سجل عمولة نهائياً', () => {
      if (window.confirm('هل أنت متأكد من حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
        deleteRecordMutation.mutate(recordId);
      }
    });
  };`;

const newHandleDelete = `const handleDelete = (record: any, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('أرشفة سجل العمولة', () => {
      const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
      if (!reason || reason.trim() === '') {
        alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
        return;
      }
      if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
        deleteRecordMutation.mutate({ record, reason });
      } else {
        alert('تم إلغاء الأرشفة.');
      }
    });
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

// Update the onClick inside the component where handleDelete is called
code = code.replace(/onClick=\{\(e\) => handleDelete\(record.id, e\)\}/g, "onClick={(e) => handleDelete(record, e)}");

fs.writeFileSync('src/pages/Commissions/CommissionRecords.tsx', code);
