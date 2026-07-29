const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

if (!code.includes("case 'SYNC_PRODUCT_IMAGES':")) {
  code = code.replace(/case 'GET_PRODUCTS': return responseOk\(getTableData\('Products', \{CompanyID: payload\.CompanyID\}\)\);/, 
    "case 'GET_PRODUCTS': return responseOk(getTableData('Products', {CompanyID: payload.CompanyID}));\n      case 'SYNC_PRODUCT_IMAGES': return responseOk(syncProductImages(payload));");

  const syncFunc = `
function syncProductImages(payload) {
  const props = PropertiesService.getScriptProperties();
  const cloudName = props.getProperty('CLOUDINARY_CLOUD_NAME');
  const apiKey = props.getProperty('CLOUDINARY_API_KEY');
  const apiSecret = props.getProperty('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      message: 'Cloudinary credentials are not set in Script Properties. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: []
    };
  }

  // Fetch images from Cloudinary Admin API
  let allImages = [];
  let nextCursor = null;
  const baseUrl = \`https://api.cloudinary.com/v1_1/\${cloudName}/resources/search\`;

  do {
    const query = {
      expression: "resource_type:image",
      with_field: ["tags", "context"],
      max_results: 500
    };
    if (nextCursor) {
      query.next_cursor = nextCursor;
    }

    const options = {
      method: 'post',
      headers: {
        "Authorization": "Basic " + Utilities.base64Encode(apiKey + ":" + apiSecret)
      },
      contentType: 'application/json',
      payload: JSON.stringify(query),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(baseUrl, options);
    if (response.getResponseCode() !== 200) {
      return { success: false, message: 'Cloudinary API error: ' + response.getContentText(), totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };
    }

    const data = JSON.parse(response.getContentText());
    allImages = allImages.concat(data.resources || []);
    nextCursor = data.next_cursor;

  } while (nextCursor);

  const normalize = (name) => {
    if (!name) return '';
    let n = String(name).replace(/\\.[^/.]+$/, "");
    return n.trim().toLowerCase();
  };

  const cloudinaryMap = new Map();
  const duplicates = [];

  allImages.forEach(img => {
    const dName = normalize(img.display_name);
    const fName = normalize(img.original_filename || img.filename);
    const pubId = normalize(img.public_id.split('/').pop());

    const matchedName = dName || fName || pubId;
    if (matchedName) {
       if (cloudinaryMap.has(matchedName)) {
         duplicates.push(matchedName);
       } else {
         cloudinaryMap.set(matchedName, img.secure_url);
       }
    }
  });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return { success: false, message: 'Products sheet not found', totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, message: 'No products to sync', totalProducts: 0, totalImages: allImages.length, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates };
  
  const headers = data[0];
  const skuIndex = headers.indexOf('SKU');
  const imageIndex = headers.indexOf('ImageURL');

  if (skuIndex === -1) return { success: false, message: 'SKU column not found', totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };

  let colImageURL = imageIndex + 1;
  if (imageIndex === -1) {
    colImageURL = headers.length + 1;
    sheet.getRange(1, colImageURL).setValue('ImageURL');
  }

  let matchCount = 0;
  let noMatchCount = 0;
  let updatedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const sku = String(data[i][skuIndex]).trim();
    if (!sku) continue;

    const normalizedSku = sku.toLowerCase();
    if (cloudinaryMap.has(normalizedSku)) {
      const url = cloudinaryMap.get(normalizedSku);
      if (imageIndex === -1 || data[i][imageIndex] !== url) {
        sheet.getRange(i + 1, colImageURL).setValue(url);
        updatedCount++;
      }
      matchCount++;
    } else {
      noMatchCount++;
    }
  }

  return {
    totalProducts: data.length - 1,
    totalImages: allImages.length,
    matchCount,
    noMatchCount,
    updatedCount,
    duplicates
  };
}
`;
  code += "\n" + syncFunc;
  fs.writeFileSync('src/backend/Code.gs', code);
}
