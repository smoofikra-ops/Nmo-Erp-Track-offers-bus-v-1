const fs = require('fs');
let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

// 1. Remove the wrongly injected modal from the isFormOpen block.
const wrongModalRegex = /\s*\{employeeToDelete && \([\s\S]*?\}\s*\)\}\s*<\/div>\s*\);\s*\}/;
// Wait, the regex might be tricky. Let's just find where it was injected.
code = code.replace(
  /\{employeeToDelete && \([\s\S]*?\)\}\s*<\/div>\s*\);\s*\}/,
  `</div>
  );
}`
);

// 2. Add the modal before the final return closing div
const finalBlockRegex = /<\/Card>\s*<\/div>\s*\);\s*\}/;
const finalModalCode = `      </Card>

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
}`;
code = code.replace(finalBlockRegex, finalModalCode);

fs.writeFileSync('src/pages/Employees/index.tsx', code);
