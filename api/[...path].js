export default async function handler(req, res) {
  const targetHost = 'dedw231-new-api.hf.space';
  
  // 获取路径
  const path = req.url || '/';
  const targetUrl = `https://${targetHost}${path}`;

  // 构建请求头
  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  headers.host = targetHost;
  headers.origin = `https://${targetHost}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // 设置响应头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    // 转发响应头
    for (const [key, value] of response.headers.entries()) {
      if (key !== 'content-encoding' && key !== 'transfer-encoding' && key !== 'content-security-policy') {
        res.setHeader(key, value);
      }
    }

    // 处理重定向
    const location = response.headers.get('location');
    if (location) {
      const newLocation = location.replace(`https://${targetHost}`, `https://${req.headers.host}`);
      res.setHeader('location', newLocation);
    }

    const body = await response.text();
    res.status(response.status).send(body);
  } catch (error) {
    res.status(502).send('Proxy Error: ' + error.message);
  }
}
