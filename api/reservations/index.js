import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

const readJsonBody = async (req) => {
  if (req.body && typeof req.body === 'object') return req.body;
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return {};
  return JSON.parse(raw);
};

const toReservation = (row) => ({
  id: Number(row.id),
  customerName: String(row.customer_name ?? row.customerName ?? ''),
  customerPhone: String(row.customer_phone ?? row.customerPhone ?? ''),
  activity: String(row.activity ?? ''),
  route: String(row.route ?? ''),
  date: String(row.date ?? ''),
  status: String(row.status ?? 'Pending'),
  timestamp: String(row.timestamp ?? row.created_at ?? new Date().toISOString()),
  source:
    String(row.source ?? '').toLowerCase() === 'special'
      ? 'special'
      : String(row.source ?? '').toLowerCase() === 'event'
        ? 'event'
        : undefined,
  amount: row.amount === null || row.amount === undefined ? undefined : Number(row.amount),
  eventId: row.event_id === null || row.event_id === undefined ? undefined : String(row.event_id),
  referredByCode:
    row.referred_by_code === null || row.referred_by_code === undefined
      ? undefined
      : String(row.referred_by_code)
});

const getClient = () => {
  const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const serviceRoleKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

const reservationsTable =
  (process.env.SUPABASE_RESERVATIONS_TABLE || process.env.VITE_SUPABASE_RESERVATIONS_TABLE || '')
    .trim() || 'reservations';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const body = await readJsonBody(req);
    if (!body.customerName || !body.customerPhone || !body.activity || !body.route || !body.date) {
      res.statusCode = 400;
      res.end('Missing required reservation fields');
      return;
    }

    const client = getClient();
    const payload = {
      customer_name: body.customerName,
      customer_phone: body.customerPhone,
      activity: body.activity,
      route: body.route,
      date: body.date,
      status: body.status || 'Pending',
      timestamp: new Date().toISOString(),
      source: body.source || 'event',
      amount: body.amount ?? null,
      event_id: body.eventId ?? null,
      referred_by_code: body.referredByCode ?? null
    };

    const { data, error } = await client
      .from(reservationsTable)
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      res.statusCode = 502;
      res.end(error?.message || 'Supabase insert failed');
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(toReservation(data)));
  } catch (error) {
    res.statusCode = 500;
    res.end(error?.message || 'Reservations API failed');
  }
}
