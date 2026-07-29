const fs = require('fs');
let code = fs.readFileSync('gas/quotesModule.gs', 'utf8');

// Remove QuoteProducts from setupQuotesModuleSheets
code = code.replace(/\{\s*name: 'QuoteProducts'[\s\S]*?\},/g, '');

// Also comment out handleGetQuoteProducts, handleCreateQuoteProduct, etc. just in case
code = code.replace(/function handleGetQuoteProducts\([\s\S]*?return createResponse[^}]+\}/, '/* handleGetQuoteProducts removed */');
code = code.replace(/function handleCreateQuoteProduct\([\s\S]*?return createResponse[^}]+\}[^}]+\}/, '/* handleCreateQuoteProduct removed */');

fs.writeFileSync('gas/quotesModule.gs', code);
