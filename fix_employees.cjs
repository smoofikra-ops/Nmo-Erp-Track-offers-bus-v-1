const fs = require('fs');

let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

code = code.replace(/\(typeof res\.error\?\.details === 'string' && res\.error\.details\.includes\)\('DuplicateMobile'\)/g, "(typeof res.error?.details === 'string' && res.error.details.includes('DuplicateMobile'))");
code = code.replace(/\(typeof res\.message === 'string' && res\.message\.includes\)\('DuplicateMobile'\)/g, "(typeof res.message === 'string' && res.message.includes('DuplicateMobile'))");

fs.writeFileSync('src/pages/Employees/index.tsx', code);
console.log("Fixed syntax in Employees index");
