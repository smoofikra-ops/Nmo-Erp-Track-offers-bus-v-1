const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

// Add DELETE and RESTORE endpoints
code = code.replace(
  "case 'UPDATE_EMPLOYEE': return responseOk(updateEmployee(payload));",
  `case 'UPDATE_EMPLOYEE': return responseOk(updateEmployee(payload));
      case 'DELETE_EMPLOYEE': return responseOk(deleteEmployee(payload));
      case 'RESTORE_EMPLOYEE': return responseOk(restoreEmployee(payload));`
);

// Add deleteEmployee and restoreEmployee implementations
const impls = `
function deleteEmployee(payload) {
  updateRow('Employees', 'EmployeeID', payload.EmployeeID, { IsDeleted: true, DeletedAt: getTimestamp() });
  return { success: true };
}

function restoreEmployee(payload) {
  updateRow('Employees', 'EmployeeID', payload.EmployeeID, { IsDeleted: false, DeletedAt: '' }, true);
  return { success: true };
}
`;

code = code.replace("function createProduct(payload)", impls + "\nfunction createProduct(payload)");

// To make updateRow work on deleted items, we need to modify updateRow:
code = code.replace(
  "if (data[i][pkIndex] === primaryKeyValue && data[i][headers.indexOf('IsDeleted')] !== true)",
  "if (data[i][pkIndex] === primaryKeyValue)" // just match primary key. We handle IsDeleted in getTableData anyway.
);

// We need to enforce unique mobile in createEmployee
code = code.replace(
  "function createEmployee(payload) {",
  `function createEmployee(payload) {
  if (payload.Mobile) {
    const existing = getTableData('Employees', {CompanyID: payload.CompanyID, Mobile: payload.Mobile});
    if (existing.length > 0) throw new Error("DuplicateMobile");
  }`
);

code = code.replace(
  "function updateEmployee(payload) {",
  `function updateEmployee(payload) {
  if (payload.Mobile) {
    const existing = getTableData('Employees', {CompanyID: payload.CompanyID, Mobile: payload.Mobile});
    if (existing.length > 0 && existing[0].EmployeeID !== payload.EmployeeID) throw new Error("DuplicateMobile");
  }`
);

// We want getTableData to return deleted if requested
code = code.replace(
  "if (row.IsDeleted === true || row.IsDeleted === 'TRUE') return false;",
  "if (!filters.includeDeleted && (row.IsDeleted === true || row.IsDeleted === 'TRUE' || row.IsDeleted === 'true')) return false;"
);
// and in getTableData remove the includeDeleted from the filter loop
code = code.replace(
  "for (let key in filters) {",
  `for (let key in filters) {
      if (key === 'includeDeleted') continue;`
);

// in GET_EMPLOYEES we want all so we can restore
code = code.replace(
  "case 'GET_EMPLOYEES': return responseOk(getTableData('Employees', {CompanyID: payload.CompanyID}));",
  "case 'GET_EMPLOYEES': return responseOk(getTableData('Employees', {CompanyID: payload.CompanyID, includeDeleted: true}));"
);

fs.writeFileSync('src/backend/Code.gs', code);
