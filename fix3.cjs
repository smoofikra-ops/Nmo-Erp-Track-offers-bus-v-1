const fs = require('fs');

let builder = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');
builder = builder.replace(/import \{ OfferItem, OfferAdjustment, QuoteOffer \} from '@\/types\/quotes';/, "import { OfferItem, OfferAdjustment, QuoteOffer, OfferStatus } from '@/types/quotes';");
builder = builder.replace(/createdBy: user\?.uid \|\| 'unknown',/g, ''); // remove createdBy as it's not in the type
fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', builder);

let history = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
history = history.replace(/import \{ Button \} from '@\/components\/ui\/button';/, "import { Button } from '@/components/ui/button';\nimport { QuoteOffer, OfferStatus } from '@/types/quotes';");
fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', history);
