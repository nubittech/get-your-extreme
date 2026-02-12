import { requireSupabase } from './supabase';

export type RegisteredUser = {
  id: string;
  fullName: string | null;
  phone: string | null;
  refCode: string | null;
  role: 'admin' | 'customer' | null;
  createdAt: string | null;
};

export const listRegisteredUsers = async (): Promise<RegisteredUser[]> => {
  const supabase = requireSupabase();

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, ref_code, created_at')
    .order('created_at', { ascending: false });

  if (profilesError) {
    throw new Error(`Users list failed: ${profilesError.message}`);
  }

  const userIds = (profiles ?? []).map((item) => String(item.id));
  if (userIds.length === 0) return [];

  const { data: roles, error: rolesError } = await supabase
    .from('user_roles')
    .select('user_id, role')
    .in('user_id', userIds);

  if (rolesError) {
    throw new Error(`User roles fetch failed: ${rolesError.message}`);
  }

  const roleMap = new Map<string, 'admin' | 'customer'>();
  (roles ?? []).forEach((item) => {
    const role = item.role;
    if (role === 'admin' || role === 'customer') {
      roleMap.set(String(item.user_id), role);
    }
  });

  return (profiles ?? []).map((item) => ({
    id: String(item.id),
    fullName: item.full_name ?? null,
    phone: item.phone ?? null,
    refCode: item.ref_code ?? null,
    role: roleMap.get(String(item.id)) ?? null,
    createdAt: item.created_at ?? null
  }));
};
