const fs = require('fs');

let file = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

file = file.replace(/import \{ quoteProductService \} from '@\/services\/quoteProductService';/, "import { productService } from '@/services/productService';");
file = file.replace(/import \{ ProductCategory, QuoteProduct, OfferItem \} from '@\/types\/quotes';/, "import { ProductCategory, OfferItem } from '@/types/quotes';\nimport { Product } from '@/types/models';");
file = file.replace(/queryKey: \['quoteProducts', companyId\],/, "queryKey: ['products', companyId],");
file = file.replace(/queryFn: \(\) => quoteProductService\.getQuoteProducts\(companyId\),/, "queryFn: () => productService.getProducts(companyId),");
file = file.replace(/p\.nameAr/g, "p.ArabicName");
file = file.replace(/p\.nameEn/g, "p.EnglishName");
file = file.replace(/p\.sku/g, "p.SKU");
file = file.replace(/p\.category/g, "p.Category");
file = file.replace(/p\.imageUrl/g, "p.ImageURL");
file = file.replace(/const handleAdd = \(product: QuoteProduct\) => \{/, "const handleAdd = (product: any) => {");

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', file);
