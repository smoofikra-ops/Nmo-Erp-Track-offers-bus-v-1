const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

const additionalCases = `
      // QUOTES
      case 'GET_OFFERS': return handleGetOffers(payload);
      case 'GET_OFFER': return handleGetOffer(payload);
      case 'CREATE_OFFER': return handleCreateOffer(payload);
      case 'UPDATE_OFFER': return handleUpdateOffer(payload);
      case 'DELETE_OFFER': return handleDeleteOffer(payload);
`;

code = code.replace(/case 'GET_COMMISSION_RECEIPTS': return responseOk\(getCommissionReceipts\(payload\)\);/, "case 'GET_COMMISSION_RECEIPTS': return responseOk(getCommissionReceipts(payload));\n" + additionalCases);

fs.writeFileSync('src/backend/Code.gs', code);
