const fs = require('fs');

let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

const archiveImport = "import { archiveService } from '@/services/archiveService';";
if (!code.includes('archiveService')) {
  code = code.replace("import { employeeService } from '@/services/employeeService';", "import { employeeService } from '@/services/employeeService';\n" + archiveImport);
}

const oldMutationRegex = /mutationFn: \(emp: Employee\) => employeeService\.deleteEmployee\(emp\.EmployeeID, companyId\),/g;

const newMutation = `mutationFn: async ({ emp, reason }: { emp: Employee, reason: string }) => {
      const userStr = localStorage.getItem('user');
      const adminUser = userStr ? JSON.parse(userStr) : { id: 'admin-1', name: 'Admin', role: 'admin' };
      return archiveService.archiveRecord('EMPLOYEE', emp, reason, adminUser, companyId);
    },`;

code = code.replace(oldMutationRegex, newMutation);

const oldHandleDelete = `const handleDelete = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('حذف موظف نهائياً', () => {
      if (window.confirm('هل أنت متأكد من حذف هذا الموظف نهائياً؟ هذا الإجراء سيخفي الموظف من القوائم الحالية.')) {
        deleteEmployeeMutation.mutate(emp);
      }
    });
  };`;

const newHandleDelete = `const handleDelete = (emp: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    requireAdminAuth('أرشفة موظف', () => {
      const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
      if (!reason || reason.trim() === '') {
        alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
        return;
      }
      if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
        deleteEmployeeMutation.mutate({ emp, reason });
      } else {
        alert('تم إلغاء الأرشفة.');
      }
    });
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

fs.writeFileSync('src/pages/Employees/index.tsx', code);
