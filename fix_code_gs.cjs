const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

const restoreCase = `
      case 'RESTORE_RECORD': return responseOk(restoreRecord(payload));
`;

if (!code.includes('case \'RESTORE_RECORD\'')) {
  code = code.replace("case 'DELETE_COMMISSION_RECORD': return responseOk(deleteCommissionRecord(payload));", "case 'DELETE_COMMISSION_RECORD': return responseOk(deleteCommissionRecord(payload));" + restoreCase);
}

const restoreFunction = `
function restoreRecord(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { tableName, idField, idValue } = payload;
    updateRow(tableName, idField, idValue, { IsDeleted: false });
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}
`;

if (!code.includes('function restoreRecord')) {
  code += "\n" + restoreFunction;
}

fs.writeFileSync('src/backend/Code.gs', code);
