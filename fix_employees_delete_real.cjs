const fs = require('fs');

let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

const oldHandleDelete = `const handleDelete = (emp: Employee) => {
    requireAdminAuth('حذف الموظف', () => {
      setEmployeeToDelete(emp);
    });
  };`;

const newHandleDelete = `const handleDelete = (emp: Employee) => {
    requireAdminAuth('أرشفة الموظف', () => {
      const reason = window.prompt('الرجاء إدخال سبب الأرشفة (مطلوب):');
      if (!reason || reason.trim() === '') {
        alert('يجب إدخال سبب الأرشفة لإتمام العملية.');
        return;
      }
      if (window.prompt('لتأكيد الأرشفة، اكتب ARCHIVE') === 'ARCHIVE') {
        deleteMutation.mutate({ emp, reason });
      } else {
        alert('تم إلغاء الأرشفة.');
      }
    });
  };`;

code = code.replace(oldHandleDelete, newHandleDelete);

// Remove the employeeToDelete state and confirmDelete modal if possible, but leaving it unused is fine.
// Wait, the modal is shown when `employeeToDelete` is not null. Since we don't set it anymore, the modal never shows.

fs.writeFileSync('src/pages/Employees/index.tsx', code);
