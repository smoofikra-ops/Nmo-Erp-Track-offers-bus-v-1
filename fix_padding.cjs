const fs = require('fs');
let code = fs.readFileSync('src/components/commissions/PrintableCommissionSummary.tsx', 'utf8');

// The user asked to compress padding and font sizes.
// Instead of modifying everything manually, we can add a wrapper class `.print-compact` and use CSS,
// OR just do some global replaces in the component for p-2.5, p-3, text-sm to smaller values.

// 1. Reduce header height
code = code.replace(
  'className="flex items-center justify-between border-b-2 border-emerald-600 pb-6 mb-6"',
  'className="flex items-center justify-between border-b-2 border-emerald-600 pb-3 mb-4"'
);

// 2. Reduce margins for sections
code = code.replace(/className="mb-6"/g, 'className="mb-3"');
code = code.replace(/className="mb-6 bg-slate-50/g, 'className="mb-3 bg-slate-50');

// 3. Adjust signature spacing
code = code.replace(
  'className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs relative"',
  'className="mt-6 pt-4 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs relative"'
);

code = code.replace(
  'className="font-bold text-slate-700 mb-10"',
  'className="font-bold text-slate-700 mb-6"'
);

// 4. Reduce footer padding
code = code.replace(
  'className="mt-12 pt-4 border-t border-slate-200 text-[10px] text-slate-500 flex justify-between items-end print:block print:w-full print:pt-4"',
  'className="mt-4 pt-2 border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-end print:block print:w-full"'
);

fs.writeFileSync('src/components/commissions/PrintableCommissionSummary.tsx', code);
console.log("Replaced padding");
