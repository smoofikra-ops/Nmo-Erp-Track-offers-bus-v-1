const GAS_URL = "https://script.google.com/macros/s/AKfycbxRRVZ-bgzFZwbhqqEMxQF_sjnmPC0oEQwqpQDWXHZPzlc12o6CZEHohzZF8OzECp6s/exec";

async function testAction(action) {
  console.log(`Testing ${action}...`);
  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, payload: { CompanyID: 'COM-0001' } })
    });
    console.log(`${action} status:`, res.status);
    const text = await res.text();
    console.log(`${action} response length:`, text.length, "Preview:", text.slice(0, 100));
  } catch (err) {
    console.error(`${action} error:`, err.message);
  }
}

async function run() {
  await testAction('GET_COMMISSION_RECORDS');
  await testAction('GET_COMMISSION_RECEIPTS');
}
run();
