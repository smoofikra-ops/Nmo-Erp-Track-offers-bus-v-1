const fs = require('fs');
let content = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

content = content.replace('className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"', 'className="w-full max-w-full px-4 py-8 sm:px-6 lg:px-8"');

fs.writeFileSync('src/layouts/MainLayout.tsx', content);
