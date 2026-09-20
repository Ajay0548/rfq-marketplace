const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION ---');

  // 1. Health check
  const health = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check:', health.status === 200 && health.data.success ? 'PASS' : 'FAIL');

  // 2. Buyer Login
  const buyerLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'buyer@example.com', password: 'Buyer@123' }
  );
  const buyerToken = buyerLogin.data.data?.token;
  console.log('2. Buyer Login:', buyerLogin.status === 200 && buyerToken && buyerLogin.data.data.user.role === 'BUYER' ? 'PASS' : 'FAIL');

  // 3. Supplier Login
  const supplierLogin = await request(
    { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
    { email: 'supplier@example.com', password: 'Supplier@123' }
  );
  const supplierToken = supplierLogin.data.data?.token;
  console.log('3. Supplier Login:', supplierLogin.status === 200 && supplierToken && supplierLogin.data.data.user.role === 'SUPPLIER' ? 'PASS' : 'FAIL');

  // 4. Browse RFQs (Public/Supplier)
  const rfqs = await request({ hostname: 'localhost', port: 5000, path: '/api/rfqs', method: 'GET' });
  console.log('4. Browse RFQs (returns 3 open):', rfqs.status === 200 && rfqs.data.data.length === 3 ? 'PASS' : 'FAIL', `(${rfqs.data.data.length} found)`);

  // 5. Buyer Dashboard
  const buyerDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/buyer/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  console.log('5. Buyer Dashboard:', buyerDash.status === 200 && buyerDash.data.data.totalRfqs === 4 ? 'PASS' : 'FAIL', buyerDash.data.data);

  // 6. View Quotations for RFQ 1 (Buyer only)
  const rfq1Quotes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/rfqs/1/quotations',
    method: 'GET',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  console.log('6. View Quotations for RFQ 1:', rfq1Quotes.status === 200 && rfq1Quotes.data.data.quotations.length === 2 ? 'PASS' : 'FAIL', `(${rfq1Quotes.data.data?.quotations?.length} quotes)`);

  // 7. Role Check: Supplier trying to create RFQ (should be 403 Forbidden)
  const supplierCreateRfq = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/rfqs',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supplierToken}` },
    },
    {
      productName: 'Illegal RFQ',
      description: 'Test',
      quantity: 10,
      deliveryLocation: 'Delhi',
      deadline: '2026-12-31',
    }
  );
  console.log('7. Supplier cannot create RFQ (403):', supplierCreateRfq.status === 403 ? 'PASS' : 'FAIL');

  // 8. Role Check: Buyer trying to submit quotation (should be 403 Forbidden)
  const buyerSubmitQuote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/rfqs/1/quotations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${buyerToken}` },
    },
    { quotedPrice: 50000, estimatedDelivery: '5 days' }
  );
  console.log('8. Buyer cannot submit quote (403):', buyerSubmitQuote.status === 403 ? 'PASS' : 'FAIL');

  // 9. Deadline Check: Supplier submitting quote on expired RFQ 4 (should be 400 Bad Request)
  const expiredQuote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/rfqs/4/quotations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supplierToken}` },
    },
    { quotedPrice: 60000, estimatedDelivery: '3 days' }
  );
  console.log('9. Cannot quote on expired/closed RFQ (400):', expiredQuote.status === 400 ? 'PASS' : 'FAIL', expiredQuote.data.message);

  // 10. Duplicate Quote Check: Supplier 1 quoting on RFQ 1 again (should be 409 Conflict)
  const duplicateQuote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/rfqs/1/quotations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supplierToken}` },
    },
    { quotedPrice: 42000, estimatedDelivery: '6 days' }
  );
  console.log('10. Duplicate quote prevented (409):', duplicateQuote.status === 409 ? 'PASS' : 'FAIL', duplicateQuote.data.message);

  // 11. Supplier submits new valid quote on RFQ 3
  const validQuote = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/rfqs/3/quotations',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${supplierToken}` },
    },
    { quotedPrice: 185000, estimatedDelivery: '10 days', message: 'Includes test certificates and delivery to Pune.' }
  );
  console.log('11. Supplier submits valid quote on RFQ 3 (201):', validQuote.status === 201 ? 'PASS' : 'FAIL');

  // 12. Supplier My Quotations
  const supplierQuotes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/supplier/quotations',
    method: 'GET',
    headers: { Authorization: `Bearer ${supplierToken}` },
  });
  console.log('12. Supplier My Quotations:', supplierQuotes.status === 200 && supplierQuotes.data.data.length >= 3 ? 'PASS' : 'FAIL', `(${supplierQuotes.data.data.length} quotes listed)`);

  console.log('--- BACKEND API VERIFICATION FINISHED ---');
}

runTests().catch(console.error);
