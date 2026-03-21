import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Iyzipay = require('iyzipay');

const readBody = async (req) => {
  if (req.body) return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  return raw;
};

const parseCallbackToken = (body) => {
  if (!body) return null;
  if (typeof body === 'object') {
    return body.token || body.checkoutFormToken || null;
  }
  const params = new URLSearchParams(body);
  return params.get('token') || params.get('checkoutFormToken');
};

const getBaseUrl = (req) => {
  const explicit = process.env.IYZICO_CALLBACK_BASE_URL;
  if (explicit) return explicit.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  const apiKey = process.env.IYZICO_API_KEY;
  const secretKey = process.env.IYZICO_SECRET_KEY;
  const baseUrl = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

  if (!apiKey || !secretKey) {
    res.statusCode = 500;
    res.end('Missing IYZICO_API_KEY or IYZICO_SECRET_KEY');
    return;
  }

  try {
    const rawBody = await readBody(req);
    const token = parseCallbackToken(rawBody);
    if (!token) {
      res.statusCode = 400;
      res.end('Missing token');
      return;
    }

    const iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri: baseUrl
    });

    iyzipay.checkoutForm.retrieve({ token }, (error, result) => {
      const base = getBaseUrl(req);
      if (error || !result) {
        res.statusCode = 302;
        res.setHeader('Location', `${base}/?payment=failure`);
        res.end();
        return;
      }

      const status = String(result.status || '').toLowerCase() === 'success' ? 'success' : 'failure';
      const conversationId = result.conversationId || '';
      const paymentId = result.paymentId || '';
      const params = new URLSearchParams({
        payment: status,
        conversationId,
        paymentId
      });

      res.statusCode = 302;
      res.setHeader('Location', `${base}/?${params.toString()}`);
      res.end();
    });
  } catch (err) {
    res.statusCode = 302;
    res.setHeader('Location', `${getBaseUrl(req)}/?payment=failure`);
    res.end();
  }
}
