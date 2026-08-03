const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');

const theadReplacement = `<thead className="bg-slate-50 text-slate-500 text-xs border-b">
                  <tr>
                    <th className="px-3 py-3 font-medium">المنتج</th>
                    <th className="px-3 py-3 font-medium text-center">الكمية (وحدة)</th>
                    <th className="px-3 py-3 font-medium text-center">التكلفة (بدون)</th>
                    <th className="px-3 py-3 font-medium text-center">التكلفة (شامل)</th>
                    <th className="px-3 py-3 font-medium text-center">سعر البيع (بدون)</th>
                    <th className="px-3 py-3 font-medium text-center">سعر البيع (شامل)</th>
                    <th className="px-3 py-3 font-medium text-center">إجمالي البيع</th>
                    <th className="px-3 py-3 font-medium text-center">الربح</th>
                    <th className="px-3 py-3 font-medium text-center">الهامش</th>
                    <th className="px-2 py-3 w-8"></th>
                  </tr>
                </thead>`;

code = code.replace(/<thead.*?<\/thead>/s, theadReplacement);

const tbodyReplacement = `                <tbody className="divide-y divide-slate-100">
                  {cartItems.map(item => {
                    const totalCost = item.unitPurchaseCostExVat * item.quantity;
                    const totalSale = item.unitSellingPriceExVat * item.quantity;
                    const profit = totalSale - totalCost;
                    const margin = totalSale > 0 ? (profit / totalSale) * 100 : 0;
                    
                    return (
                    <tr key={item.productId} className="hover:bg-slate-50/30 transition-colors text-sm">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-white rounded border border-slate-100 p-1 flex-shrink-0">
                            <img src={getProductImageUrl(item.sku, item.imageUrl, item as any)} alt={item.productName} className="w-full h-full object-contain" onError={handleImageError} />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 line-clamp-1 text-xs">{item.productName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{item.sku} | <span className="font-medium text-indigo-600">وحدة/حبة</span></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button 
                            onClick={() => onUpdateItem(item.productId, { quantity: Math.max(1, item.quantity - 1) })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                          >-</button>
                          <span className="w-8 text-center font-bold text-slate-700 text-xs">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateItem(item.productId, { quantity: item.quantity + 1 })}
                            className="w-6 h-6 flex items-center justify-center bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
                          >+</button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600 font-medium">
                        {item.unitPurchaseCostExVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center text-slate-500 text-xs">
                        {item.unitPurchaseCostIncVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitSellingPriceExVat === 0 ? '' : Number(item.unitSellingPriceExVat.toFixed(2))}
                          onChange={(e) => {
                             const val = parseFloat(e.target.value) || 0;
                             onUpdateItemPrice(item.productId, val);
                          }}
                          className="w-20 text-center border-b border-slate-300 focus:border-indigo-500 focus:outline-none bg-transparent font-bold text-indigo-700 pb-0.5"
                        />
                      </td>
                      <td className="px-3 py-3 text-center text-slate-600 text-xs font-medium">
                        {item.unitSellingPriceIncVat.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-slate-800">
                        {totalSale.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-emerald-600">
                        {profit.toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-emerald-700 bg-emerald-50 rounded">
                        {margin.toFixed(1)}%
                      </td>
                      <td className="px-2 py-3 text-left">
                        <button 
                          onClick={() => onRemoveItem(item.productId)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>`;

code = code.replace(/<tbody.*?<\/tbody>/s, tbodyReplacement);

fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', code);
