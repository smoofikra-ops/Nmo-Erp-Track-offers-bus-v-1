const fs = require('fs');
let builder = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');
builder = builder.replace(/createdBy: user\?.id \|\| 'sys',/g, '');
fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', builder);

let history = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
history = history.replace(/quote\.status === OfferStatus\.Draft \? 'bg-blue-100 text-blue-800' :/g, '');
fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', history);
