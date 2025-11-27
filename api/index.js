export default async function handler(req, res) {
  const targetHost = 'dedw231-new-api.hf.space';
  const path = req.url || '/';
  const targetUrl = `https://${targetHost}${path}`;

  const headers = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (key !== 'host' && key !== 'connection' && !key.startsWith('x-vercel')) {
      headers[key] = value;
    }
  }
  headers['host'] = targetHost;

  try {
    const fetchOptions = {
      method: req.method,
      headers: headers,
    };
    
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(targetUrl, fetchOptions);

    res.setHeader('Access-Control-Allow-Origin', '*');
    
    for (const [key, value] of response.headers.entries()) {
      if (!['content-encoding', 'transfer-encoding', 'content-security-policy'].includes(key)) {
        res.setHeader(key, value);
      }
    }

    const location = response.headers.get('location');
    if (location) {
      res.setHeader('location', location.replace(`https://${targetHost}`, `https://${req.headers.host}`));
    }

    const body = await response.arrayBuffer();
    res.status(response.status).send(Buffer.from(body));
  } catch (error) {
    res.status(502).send('Proxy Error: ' + error.message);
  }
}
