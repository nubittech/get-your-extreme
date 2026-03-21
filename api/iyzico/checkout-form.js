import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Iyzipay = require('iyzipay');

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return {};
  return JSON.parse(raw);
};

const splitName = (fullName) => {
  const safe = String(fullName ?? '').trim();
  if (!safe) return { name: 'Guest', surname: 'Customer' };
  const [name, ...rest] = safe.split(' ');
  return { name, surname: rest.join(' ') || 'Customer' };
};

const formatAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return amount.toFixed(2);
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
    const payload = await readJsonBody(req);
    const amount = formatAmount(payload.amount);
    if (!amount) {
      res.statusCode = 400;
      res.end('Invalid amount');
      return;
    }

    const buyer = payload.buyer ?? {};
    const { name, surname } = splitName(buyer.fullName);
    const address = buyer.address || 'Antalya';
    const city = buyer.city || 'Antalya';
    const country = buyer.country || 'Turkey';
    const zipCode = buyer.zipCode || '07000';

    const conversationId =
      payload.conversationId ||
      `gye-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    const item = payload.item ?? {};
    const itemPrice = formatAmount(item.price ?? payload.amount) || amount;
    const callbackUrl = `${getBaseUrl(req)}/api/iyzico/callback`;

    const iyzipay = new Iyzipay({
      apiKey,
      secretKey,
      uri: baseUrl
    });

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      price: amount,
      paidPrice: amount,
      currency: payload.currency || Iyzipay.CURRENCY.TRY,
      basketId: item.id || `event-${Date.now()}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl,
      enabledInstallments: [1],
      buyer: {
        id: buyer.id || 'BY789',
        name,
        surname,
        gsmNumber: buyer.phone || '+90 500 000 0000',
        email: buyer.email || 'guest@example.com',
        identityNumber: buyer.identityNumber || '11111111111',
        lastLoginDate: buyer.lastLoginDate || new Date().toISOString(),
        registrationDate: buyer.registrationDate || new Date().toISOString(),
        registrationAddress: address,
        ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '85.34.78.112',
        city,
        country,
        zipCode
      },
      shippingAddress: {
        contactName: `${name} ${surname}`.trim(),
        city,
        country,
        address,
        zipCode
      },
      billingAddress: {
        contactName: `${name} ${surname}`.trim(),
        city,
        country,
        address,
        zipCode
      },
      basketItems: [
        {
          id: item.id || 'item-1',
          name: item.name || 'Event booking',
          category1: item.category || 'Tour',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: itemPrice
        }
      ]
    };

    iyzipay.checkoutFormInitialize.create(request, (error, result) => {
      if (error) {
        res.statusCode = 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ status: 'failure', errorMessage: error.message }));
        return;
      }
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(result));
    });
  } catch (err) {
    res.statusCode = 500;
    res.end(err?.message || 'Checkout init failed');
  }
}
