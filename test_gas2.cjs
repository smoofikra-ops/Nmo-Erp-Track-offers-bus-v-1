const GAS_URL = "https://script.google.com/macros/s/AKfycbxRRVZ-bgzFZwbhqqEMxQF_sjnmPC0oEQwqpQDWXHZPzlc12o6CZEHohzZF8OzECp6s/exec";

async function run() {
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action: 'GET_COMMISSION_RECORDS', payload: { CompanyID: 'COM-0001' } })
  });
  console.log(await res.text());
}
run();
