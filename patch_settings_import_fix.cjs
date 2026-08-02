const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings/index.tsx', 'utf8');

content = content.replace(
  "import { PrintingTab } from \"./Tabs/PrintingTab\";",
  "import { PrintingTab } from \"./Tabs/PrintingTab\";\nimport { SecurityTab } from \"./Tabs/SecurityTab\";"
);

fs.writeFileSync('src/pages/Settings/index.tsx', content);
