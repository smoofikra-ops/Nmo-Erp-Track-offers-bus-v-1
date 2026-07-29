const fs = require('fs');
let code = fs.readFileSync('src/utils/imageUtils.ts', 'utf8');

code = "import React from 'react';\n" + code;

fs.writeFileSync('src/utils/imageUtils.ts', code);
