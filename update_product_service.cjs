const fs = require('fs');
const path = 'src/services/productService.ts';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  "  seedDefaultProducts: (companyId: string): Promise<ApiResponse<any>> => {",
  "  deleteProduct: (productId: string, companyId: string): Promise<ApiResponse<any>> => {\n    return ApiClient.post('DELETE_PRODUCT', { ProductID: productId, CompanyID: companyId });\n  },\n  seedDefaultProducts: (companyId: string): Promise<ApiResponse<any>> => {"
);
fs.writeFileSync(path, content);
