const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

code = code.replace(
  /import defaultProductImage from '@\/assets\/images\/regenerated_image_1785281720906\.jpg';/,
  `// @ts-ignore\nimport defaultProductImage from '@/assets/images/regenerated_image_1785281720906.jpg';`
);

fs.writeFileSync('src/pages/Products/index.tsx', code);
