const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');

code = code.replace(/<input\s+([^>]+)className="([^"]+)"([^>]*)>/g, (match, p1, p2, p3) => {
  if (!p2.includes('border-slate-300') && !p2.includes('border')) {
    return `<input ${p1}className="${p2} rounded-md border border-slate-300 px-3 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"${p3}>`;
  }
  return match;
});

fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', code);
