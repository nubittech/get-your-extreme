import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { createClient } = require('@supabase/supabase-js');

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

const toUser = (profileRow, roleMap) => ({
  id: String(profileRow.id),
  fullName: profileRow.full_name ?? null,
  phone: profileRow.phone ?? null,
  refCode: profileRow.ref_code ?? null,
  role: roleMap.get(String(profileRow.id)) ?? null,
  createdAt: profileRow.created_at ?? null
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET');
    res.end('Method Not Allowed');
    return;
  }

  try {
    const client = getClient();
    const { data: profiles, error: profilesError } = await client
      .from('profiles')
      .select('id, full_name, phone, ref_code, created_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      res.statusCode = 502;
      res.end(`Profiles fetch failed: ${profilesError.message}`);
      return;
    }

    const userIds = (profiles ?? []).map((item) => String(item.id));
    if (userIds.length === 0) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify([]));
      return;
    }

    const { data: roles, error: rolesError } = await client
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    if (rolesError) {
      res.statusCode = 502;
      res.end(`Roles fetch failed: ${rolesError.message}`);
      return;
    }

    const roleMap = new Map();
    (roles ?? []).forEach((item) => {
      if (item.role === 'admin' || item.role === 'customer') {
        roleMap.set(String(item.user_id), item.role);
      }
    });

    const payload = (profiles ?? []).map((item) => toUser(item, roleMap));
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  } catch (error) {
    res.statusCode = 500;
    res.end(error?.message || 'Users API failed');
  }
}
