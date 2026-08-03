const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

code = code.replace("const [purchaseCostExVAT, setPurchaseCostExVAT] = useState('');",
"const [purchaseCostExVAT, setPurchaseCostExVAT] = useState('');\n  const [piecesPerOfferUnit, setPiecesPerOfferUnit] = useState('1');");

code = code.replace("setPurchaseCostExVAT('');", "setPurchaseCostExVAT('');\n    setPiecesPerOfferUnit('1');");

code = code.replace("setPurchaseCostExVAT('0');", "setPurchaseCostExVAT('0');\n      setPiecesPerOfferUnit('1');");

code = code.replace("setPurchaseCostExVAT(p.PurchaseCostExVAT?.toString() || '0');", "setPurchaseCostExVAT(p.PurchaseCostExVAT?.toString() || '0');\n      setPiecesPerOfferUnit(p.PiecesPerOfferUnit?.toString() || '1');");

code = code.replace("PurchaseCostExVAT: parsedPurchaseExVAT,", "PurchaseCostExVAT: parsedPurchaseExVAT,\n      PiecesPerOfferUnit: Number(piecesPerOfferUnit) || 1,");

const inputReplacement = `<div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">عدد الوحدات في الكرتون (Units Per Carton)</label>
              <input type="number" min="1" className="w-full h-10 rounded-md border px-3 focus:ring-2 focus:ring-emerald-500" value={piecesPerOfferUnit} onChange={e => setPiecesPerOfferUnit(e.target.value)} />
            </div>`;

code = code.replace(/<div className="space-y-2">\s*<label className="text-sm font-medium text-slate-700">التكلفة \(بدون ضريبة\).*?<\/div>/s, match => {
  return match + '\n            ' + inputReplacement;
});

const thReplacement = `<th className="px-4 py-3 font-medium">تكلفة الكرتون</th>
                <th className="px-4 py-3 font-medium">الوحدات (بالكرتون)</th>
                <th className="px-4 py-3 font-medium">تكلفة الوحدة</th>`;
code = code.replace('<th className="px-4 py-3 font-medium">التكلفة</th>', thReplacement);

const tdReplacement = `<td className="px-4 py-2">{Number(p.PurchaseCostExVAT || 0).toFixed(2)}</td>
                    <td className="px-4 py-2 text-center">{p.PiecesPerOfferUnit || 1}</td>
                    <td className="px-4 py-2 text-amber-600 font-bold">{((p.PurchaseCostExVAT || 0) / (p.PiecesPerOfferUnit || 1)).toFixed(2)}</td>`;
code = code.replace('<td className="px-4 py-2">{Number(p.PurchaseCostExVAT || 0).toFixed(2)}</td>', tdReplacement);


fs.writeFileSync('src/pages/Products/index.tsx', code);
