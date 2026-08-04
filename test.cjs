const arr = ["PRD-2026-000025", "PRD-2026-000001", "XXX"];
// We need to find the max PRD-YYYY-NNNNNN
let maxId = 0;
arr.forEach(sku => {
  const match = sku.match(/PRD-\d{4}-(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > maxId) maxId = num;
  }
});
console.log(maxId);
