const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

const regex = /<div className="h-16 w-16 bg-emerald-700 text-white rounded-2xl flex items-center justify-center shadow-md print:border print:border-emerald-800">[\s\S]*?<\/div>/;

const newLogo = `
              {settings?.LogoURL ? (
                <div className="h-12 w-16 flex items-center justify-center shrink-0">
                  <img src={settings.LogoURL} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : null}
`;

code = code.replace(regex, newLogo);

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
console.log("Logo replaced");
