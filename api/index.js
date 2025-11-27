export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const targetHost = 'dedw231-new-api.hf.space';
  const url = new URL(request.url);
  
  // 构建目标 URL
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  // 构建请求头
  const headers = new Headers();
  for (const [key, value] of request.headers.entries()) {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  }
  headers.set('Host', targetHost);
  headers.set('Origin', `https://${targetHost}`);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    });

    // 构建响应头
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('x-frame-options');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    // 处理重定向
    const location = response.headers.get('location');
    if (location) {
      const newLocation = location.replace(`https://${targetHost}`, url.origin);
      responseHeaders.set('location', newLocation);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response('Proxy Error: ' + error.message, { status: 502 });
  }
}
