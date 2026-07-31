const fs = require('fs');

let productsCode = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

// Add a trace panel just above the table
const tracePanel = `
      {products.length > 0 && (
        <div className="bg-slate-900 text-green-400 p-4 rounded-lg shadow-sm font-mono text-left mb-6 overflow-x-auto text-xs" dir="ltr">
          <h3 className="text-white font-bold mb-2">🔍 Data Trace (First Product)</h3>
          <div><strong className="text-blue-400">1. GAS Output (Keys):</strong> {JSON.stringify(Object.keys(products[0]))}</div>
          <div><strong className="text-blue-400">2. Raw ImageURL field:</strong> {JSON.stringify(products[0].ImageURL)}</div>
          <div><strong className="text-blue-400">3. Lowercase imageUrl field:</strong> {JSON.stringify((products[0] as any).imageUrl)}</div>
          <div><strong className="text-blue-400">4. Final imgSource calculated:</strong> {getProductImageUrl(products[0].SKU, products[0].ImageURL, products[0])}</div>
        </div>
      )}
`;

if (!productsCode.includes('Data Trace (First Product)')) {
  productsCode = productsCode.replace(/<Card>/, tracePanel + '\n      <Card>');
  fs.writeFileSync('src/pages/Products/index.tsx', productsCode);
}

