const fs = require('fs');

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

const newMockCases = `
        case 'GET_QUOTE_PRODUCTS': {
          data = this.getLocalData('mock_quote_products');
          break;
        }
        case 'CREATE_QUOTE_PRODUCT': {
          const products = this.getLocalData('mock_quote_products');
          const newProd = { 
            ...payload, 
            id: 'QPRD-' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          products.push(newProd);
          this.setLocalData('mock_quote_products', products);
          data = newProd;
          break;
        }
        case 'GET_QUOTE_OFFERS': {
          data = this.getLocalData('mock_quote_offers');
          break;
        }
        case 'CREATE_QUOTE_OFFER': {
          const offers = this.getLocalData('mock_quote_offers');
          const newOffer = {
            ...payload,
            id: 'QOFF-' + Date.now(),
            offerNumber: 'OFF-' + Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          offers.push(newOffer);
          this.setLocalData('mock_quote_offers', offers);
          data = newOffer;
          break;
        }
`;

content = content.replace("case 'GET_SYSTEM_HEALTH':", newMockCases + "\n        case 'GET_SYSTEM_HEALTH':");
fs.writeFileSync('src/services/apiClient.ts', content);
