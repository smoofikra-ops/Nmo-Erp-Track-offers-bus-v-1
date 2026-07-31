const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

if (!code.includes('const cleanHeader = String(header).trim();')) {
  code = code.replace(
    /headers\.forEach\(\(header, index\) => \{\s*obj\[header\] = row\[index\];\s*\}\);/,
    `headers.forEach((header, index) => {
      const cleanHeader = String(header).trim();
      obj[cleanHeader] = row[index];
    });`
  );
  fs.writeFileSync('src/backend/Code.gs', code);
}
