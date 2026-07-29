const fs = require('fs');

let builder = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');
if (!builder.includes('OfferStatus')) {
  builder = builder.replace(/import \{ OfferItem, OfferAdjustment, OfferTotals \} from '@\/types\/quotes';/, "import { OfferItem, OfferAdjustment, OfferTotals, OfferStatus } from '@/types/quotes';");
}
builder = builder.replace(/updates\.unitPrice/g, 'updates.unitSellingPriceIncVat');
builder = builder.replace(/createdBy: user\?.uid \|\| 'unknown',/g, ''); // remove createdBy as it's not in the type
fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', builder);

let history = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
if (!history.includes('OfferStatus')) {
  history = history.replace(/import \{ QuoteOffer \} from '@\/types\/quotes';/, "import { QuoteOffer, OfferStatus } from '@/types/quotes';");
}
fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', history);
