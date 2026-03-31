import crypto from 'crypto';

const readBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const normalizeReservationId = (value) => {
  if (value === null || value === undefined) return null;
  const raw = String(value);
  const match = raw.match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getSupabaseConfig = () => {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const key =
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();
  const table =
    (process.env.SUPABASE_RESERVATIONS_TABLE || process.env.VITE_SUPABASE_RESERVATIONS_TABLE || '')
      .trim() || 'reservations';

  return { url, key, table };
};

const updateReservationStatus = async (reservationId, status) => {
  const { url, key, table } = getSupabaseConfig();
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const response = await fetch(`${url}/rest/v1/${table}?id=eq.${reservationId}`, {
    method: 'PATCH',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: JSON.stringify({ status })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Supabase update failed (${response.status}): ${errorBody}`);
  }
};

const isSignatureValid = (payload, secretKey, signature) => {
  if (!signature || !secretKey) return false;
  const iyziEventType = String(payload.iyziEventType || '');
  const paymentId = String(payload.iyziPaymentId || payload.paymentId || '');
  const paymentConversationId = String(payload.paymentConversationId || '');
  const status = String(payload.status || '');
  const token = payload.token ? String(payload.token) : '';

  const rawKey = token
    ? `${secretKey}${iyziEventType}${paymentId}${token}${paymentConversationId}${status}`
    : `${secretKey}${iyziEventType}${paymentId}${paymentConversationId}${status}`;

  const computed = crypto
    .createHmac('sha256', secretKey)
    .update(rawKey, 'utf8')
    .digest('hex');

  return computed.toLowerCase() === String(signature).toLowerCase();
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const payload = await readBody(req);
    const signature =
      req.headers['x-iyz-signature-v3'] ||
      req.headers['x-iyz-signature'] ||
      req.headers['x-iyz-signature-v2'];
    const secretKey = process.env.IYZICO_SECRET_KEY || '';

    if (!process.env.IYZICO_WEBHOOK_SKIP_VERIFY) {
      if (!isSignatureValid(payload, secretKey, signature)) {
        res.statusCode = 401;
        res.end('Invalid signature');
        return;
      }
    }

    const reservationId = normalizeReservationId(payload.paymentConversationId);
    if (!reservationId) {
      res.statusCode = 400;
      res.end('Missing reservation id');
      return;
    }

    const status = String(payload.status || '').toUpperCase() === 'SUCCESS'
      ? 'Confirmed'
      : 'Cancelled';

    await updateReservationStatus(reservationId, status);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
  } catch (err) {
    res.statusCode = 500;
    res.end(err?.message || 'Webhook failed');
  }
}
