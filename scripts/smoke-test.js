// Robust smoke-test script for local server
const base = process.env.BASE_URL || 'http://localhost:3000';
const MAX_RETRIES = 12;
const RETRY_DELAY_MS = 1000;
const admin = { username: 'admin', password: 'Admin123!' };

function wait(ms) { return new Promise(res => setTimeout(res, ms)); }

async function fetchJson(path, options = {}) {
  const res = await fetch(base + path, options);
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text), headers: res.headers }; }
  catch { return { status: res.status, body: text, headers: res.headers }; }
}

function extractCookieFromHeader(header) {
  if (!header) return null;
  const raw = Array.isArray(header) ? header[0] : header;
  return raw.split(';')[0];
}

(async () => {
  console.log('Base URL:', base);
  // wait for server
  let up = false;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try { await fetch(base + '/api'); up = true; break; } catch { process.stdout.write('.'); await wait(RETRY_DELAY_MS); }
  }
  console.log('');
  if (!up) { console.error('Server not reachable at', base); process.exit(2); }

  const results = [];
  try {
    const loginRes = await fetch(base + '/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(admin) });
    const loginText = await loginRes.text(); let loginBody = null; try { loginBody = JSON.parse(loginText); } catch {}
    const setCookie = loginRes.headers.get('set-cookie') || loginRes.headers.get('Set-Cookie');
    const cookie = extractCookieFromHeader(setCookie);
    results.push({ step: 'login', status: loginRes.status, body: loginBody });

    if (!cookie) console.warn('No session cookie received. Authenticated endpoints may fail.');
    const headers = { 'Content-Type': 'application/json' }; if (cookie) headers['Cookie'] = cookie;

    const user = await fetchJson('/api/auth/user', { headers }); results.push({ step: 'get user', status: user.status, body: user.body });

    const tenantId = (loginBody && loginBody.tenant && loginBody.tenant.id) || (user.body && user.body.tenant && user.body.tenant.id) || null;

    const stats = await fetchJson('/api/dashboard/stats', { headers }); results.push({ step: 'dashboard stats', status: stats.status, body: stats.body });

    const products = await fetchJson('/api/products', { headers }); results.push({ step: 'get products', status: products.status, body: products.body });

    if (tenantId) {
      const newProduct = { name: 'Smoke Test Product', sku: `SMOKE-${Date.now()}`, price: 9.99, quantity: 10, minStockLevel: 2, tenantId };
      const createPr = await fetch(base + '/api/products', { method: 'POST', headers, body: JSON.stringify(newProduct) });
      const prText = await createPr.text(); let prBody = null; try { prBody = JSON.parse(prText); } catch {}
      results.push({ step: 'create product', status: createPr.status, body: prBody });
    } else { results.push({ step: 'create product', status: 'skipped', body: 'no tenantId' }); }

    const revenues = await fetchJson('/api/revenues', { headers }); results.push({ step: 'get revenues', status: revenues.status, body: revenues.body });
    const expenses = await fetchJson('/api/expenses', { headers }); results.push({ step: 'get expenses', status: expenses.status, body: expenses.body });
    const nots = await fetchJson('/api/notifications', { headers }); results.push({ step: 'get notifications', status: nots.status, body: nots.body });

    console.log('\nResults:');
    for (const r of results) {
      console.log(`${r.step}: ${r.status}`);
      if ((typeof r.status === 'number' && r.status >= 400) || r.status === 'skipped') console.log('  ->', r.body);
    }
    process.exit(0);
  } catch (err) {
    console.error('Smoke test error', err);
    process.exit(1);
  }
})();
