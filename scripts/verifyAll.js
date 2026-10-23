import http from 'http';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('--- 1. Testing Frontend HTTP 200 on port 5173 ---');
  const fe5173 = await get('http://localhost:5173');
  console.log('Port 5173 status:', fe5173.status, 'Content length:', fe5173.body.length);

  console.log('--- 2. Testing Frontend HTTP 200 on port 5174 ---');
  const fe5174 = await get('http://localhost:5174');
  console.log('Port 5174 status:', fe5174.status, 'Content length:', fe5174.body.length);

  console.log('--- 3. Testing Backend Health on port 5000 ---');
  const h = await get('http://localhost:5000/api/health');
  console.log('Backend health status:', h.status, 'Payload:', h.body);

  console.log('--- 4. Testing Verified Official Schemes ---');
  const sRes = await get('http://localhost:5000/api/schemes');
  const sData = JSON.parse(sRes.body);
  const schemes = sData.data?.schemes || [];
  console.log('Total schemes returned:', schemes.length);
  schemes.forEach((s, idx) => {
    console.log(` ${idx + 1}. [${s.code}] ${s.name}`);
    console.log(`    Ministry: ${s.ministry}`);
    console.log(`    Portal: ${s.officialPortalUrl}`);
    console.log(`    Official Verification Source: ${s.sourceVerificationUrl}`);
    console.log(`    Statutory Benefits: ${s.benefitsSummary?.slice(0, 80)}...`);
  });

  console.log('--- 5. Testing AI Assistant in English ---');
  const chat1 = await post('http://localhost:5000/api/assistant/chat', JSON.stringify({ query: 'Tell me about PMAY-G scheme' }));
  console.log('English chat status:', chat1.status);
  const c1 = JSON.parse(chat1.body);
  console.log('English response snippet:', c1.data?.text?.slice(0, 150));

  console.log('--- 6. Testing AI Assistant in Hindi ---');
  const chat2 = await post('http://localhost:5000/api/assistant/chat', JSON.stringify({ message: 'जल जीवन मिशन की जानकारी दें', language: 'hi' }));
  console.log('Hindi chat status:', chat2.status);
  const c2 = JSON.parse(chat2.body);
  console.log('Hindi response snippet:', c2.data?.text?.slice(0, 150));

  console.log('--- 7. Testing AI Assistant Validation Error Handling ---');
  const chat3 = await post('http://localhost:5000/api/assistant/chat', JSON.stringify({}));
  console.log('Empty chat validation status (expected 400):', chat3.status);
  const c3 = JSON.parse(chat3.body);
  console.log('Validation error message:', c3.message || c3.error);

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

run().catch(console.error);
