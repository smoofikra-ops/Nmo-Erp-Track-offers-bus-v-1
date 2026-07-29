const fs = require('fs');
let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

// Update saveMutation
code = code.replace(
  /onSuccess: async \(res\) => \{[\s\S]*?\},/g,
  `onSuccess: async (res) => {
      if (res.success) {
        setIsFormOpen(false);
        resetForm();
        alert('تم حفظ بيانات الموظف بنجاح.');
        await queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      } else {
        console.error('Save error details:', res);
        if (res.error?.details?.includes('DuplicateMobile') || res.message?.includes('DuplicateMobile')) {
          setErrorMsg(t('employees.duplicateMobile', 'رقم الجوال مسجل مسبقاً.'));
        } else {
          setErrorMsg('تعذر حفظ بيانات الموظف. يرجى المحاولة لاحقاً.');
        }
      }
    },`
);

// Update deleteMutation
code = code.replace(
  /const deleteMutation = useMutation\(\{[\s\S]*?\}\);/g,
  `const deleteMutation = useMutation({
    mutationFn: (emp: Employee) => employeeService.deleteEmployee(emp.EmployeeID, companyId),
    onSuccess: async (res) => {
      if (res.success) {
        alert('تم حذف الموظف بنجاح.');
        await queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      } else {
        console.error('Delete error details:', res);
        alert('تعذر حذف الموظف. يرجى المحاولة لاحقاً.');
      }
    },
    onError: (e: any) => {
      console.error('Delete network error:', e);
      alert('تعذر الاتصال بالخادم.');
    }
  });`
);

fs.writeFileSync('src/pages/Employees/index.tsx', code);
