const fs = require('fs');
let code = fs.readFileSync('src/pages/Employees/index.tsx', 'utf8');

// The problematic lines:
//   });
//     }
//   });
//   const restoreMutation = useMutation({

code = code.replace(/  \}\);\n    \}\n  \}\);\n  const restoreMutation = useMutation\(\{/, '  const restoreMutation = useMutation({');

fs.writeFileSync('src/pages/Employees/index.tsx', code);
