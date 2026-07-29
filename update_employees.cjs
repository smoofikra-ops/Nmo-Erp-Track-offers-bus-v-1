const fs = require('fs');
let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

code = code.replace(
  /const \[isFormOpen, setIsFormOpen\] = useState\(false\);/,
  `const [isFormOpen, setIsFormOpen] = useState(false);\n  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);`
);

code = code.replace(
  /const handleDelete = \(emp: Employee\) => \{\s*if \(confirm\([^)]*\)\)\) \{\s*deleteMutation.mutate\(emp\);\s*\}\s*\};/,
  `const handleDelete = (emp: Employee) => {
    setEmployeeToDelete(emp);
  };
  const confirmDelete = () => {
    if (employeeToDelete) {
      deleteMutation.mutate(employeeToDelete);
      setEmployeeToDelete(null);
    }
  };
  const cancelDelete = () => {
    setEmployeeToDelete(null);
  };`
);

// Add the modal HTML before the final return closing div
const modalCode = `
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 text-slate-900">تأكيد الحذف</h3>
              <p className="text-slate-600 mb-6">
                هل أنت متأكد من حذف الموظف "{employeeToDelete.ArabicName || employeeToDelete.EnglishName}"؟<br/>
                سيتم إخفاؤه من القوائم ولن يُحذف سجله التاريخي.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={cancelDelete}>إلغاء</Button>
                <Button variant="destructive" onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">حذف</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
`;

code = code.replace(/<\/div>\s*\);\s*\}/, modalCode);

fs.writeFileSync('src/pages/Employees/index.tsx', code);
