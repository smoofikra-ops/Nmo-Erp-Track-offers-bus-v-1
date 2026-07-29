const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

// Fix getTableData
code = code.replace(
  /if \(row\.IsDeleted === true \|\| row\.IsDeleted === "TRUE"\) return false;/g,
  `const isDel = String(row.IsDeleted).toLowerCase() === 'true' || row.IsDeleted === 1;
    if (isDel && !filters.includeDeleted) return false;`
);

// Replace deleteEmployee
code = code.replace(
  /function deleteEmployee\(payload\) \{[\s\S]*?return \{ success: true \};\n\}/,
  `function deleteEmployee(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Employees');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Ensure required columns exist
    const requiredColumns = ['IsDeleted', 'DeletedAt', 'Status', 'UpdatedAt'];
    let added = false;
    requiredColumns.forEach(col => {
      if (!headers.includes(col)) {
        sheet.insertColumnAfter(sheet.getLastColumn());
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
        added = true;
      }
    });
    
    updateRow('Employees', 'EmployeeID', payload.EmployeeID, { 
      IsDeleted: true, 
      Status: 'INACTIVE',
      DeletedAt: getTimestamp(),
      UpdatedAt: getTimestamp()
    });
    return { success: true, employeeId: payload.EmployeeID, deleted: true };
  } finally {
    lock.releaseLock();
  }
}`
);

// Replace restoreEmployee
code = code.replace(
  /function restoreEmployee\(payload\) \{[\s\S]*?return \{ success: true \};\n\}/,
  `function restoreEmployee(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    updateRow('Employees', 'EmployeeID', payload.EmployeeID, { 
      IsDeleted: false, 
      Status: 'ACTIVE',
      DeletedAt: '',
      UpdatedAt: getTimestamp()
    });
    return { success: true, employeeId: payload.EmployeeID, restored: true };
  } finally {
    lock.releaseLock();
  }
}`
);

fs.writeFileSync('src/backend/Code.gs', code);
