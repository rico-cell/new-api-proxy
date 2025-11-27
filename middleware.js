import { NextResponse } from 'next/server';

export const config = {
  matcher: '/:path*',
};

export default async function middleware(request) {
  const targetHost = 'dedw231-new-api.hf.space';
  const url = new URL(request.url);
  const targetUrl = `https://${targetHost}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set('host', targetHost);
  headers.delete('x-forwarded-for');
  headers.delete('x-vercel-ip-country');

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
      redirect: 'manual',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.delete('content-security-policy');

    const location = response.headers.get('location');
    if (location) {
      responseHeaders.set('location', location.replace(`https://${targetHost}`, url.origin));
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new NextResponse('Proxy Error: ' + error.message, { status: 502 });
  }
}
