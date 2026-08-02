const fs = require('fs');
let content = fs.readFileSync('src/routes/index.tsx', 'utf8');

// Add imports
const importsToAdd = `import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { TermsOfService } from '@/pages/TermsOfService';`;

content = content.replace("import { QuotesPage } from '@/pages/Quotes';", "import { QuotesPage } from '@/pages/Quotes';\n" + importsToAdd);

// Add routes
const routesToAdd = `  {
    path: '/privacy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/terms',
    element: <TermsOfService />,
  },`;

content = content.replace("  {    path: '/login',", routesToAdd + "\n  {    path: '/login',");

fs.writeFileSync('src/routes/index.tsx', content);
