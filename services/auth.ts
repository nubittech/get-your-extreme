import { User } from '@supabase/supabase-js';
import { requireSupabase } from './supabase';

export type UserRole = 'admin' | 'customer';

export type UserProfile = {
  fullName: string | null;
  phone: string | null;
  refCode: string | null;
  role: UserRole | null;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
};

const REF_PREFIX = 'GYE';
const REF_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateRefCode = () => {
  let code = REF_PREFIX + '-';
  for (let i = 0; i < 6; i += 1) {
    code += REF_CHARS[Math.floor(Math.random() * REF_CHARS.length)];
  }
  return code;
};

const ensureRoleRow = async (userId: string) => {
  const supabase = requireSupabase();
  const { error } = await supabase.from('user_roles').upsert(
    {
      user_id: userId,
      role: 'customer'
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw new Error(`Role setup failed: ${error.message}`);
  }
};

export const ensureProfileRow = async (
  userId: string,
  data?: { fullName?: string; phone?: string }
) => {
  const supabase = requireSupabase();
  const fullName = data?.fullName?.trim() || null;
  const phone = data?.phone?.trim() || null;

  const { data: existing, error: existingError } = await supabase
    .from('profiles')
    .select('id, ref_code')
    .eq('id', userId)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Profile check failed: ${existingError.message}`);
  }

  if (existing) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone
      })
      .eq('id', userId);

    if (updateError) {
      throw new Error(`Profile update failed: ${updateError.message}`);
    }
    return;
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const payload = {
      id: userId,
      full_name: fullName,
      phone,
      ref_code: generateRefCode()
    };
    const { error } = await supabase.from('profiles').insert(payload);
    if (!error) return;
    if (error.code !== '23505') {
      throw new Error(`Profile setup failed: ${error.message}`);
    }
  }

  throw new Error('Could not generate unique ref code.');
};

export const readUserProfile = async (userId: string): Promise<UserProfile> => {
  const supabase = requireSupabase();

  const [{ data: profileRow, error: profileError }, { data: roleRow, error: roleError }] =
    await Promise.all([
      supabase.from('profiles').select('full_name, phone, ref_code').eq('id', userId).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', userId).maybeSingle()
    ]);

  if (profileError) {
    console.warn('Profile fetch warning:', profileError.message);
  }
  if (roleError) {
    console.warn('Role fetch warning:', roleError.message);
  }

  const roleValue = roleRow?.role;
  const role = roleValue === 'admin' || roleValue === 'customer' ? roleValue : null;

  return {
    fullName: profileError ? null : profileRow?.full_name ?? null,
    phone: profileError ? null : profileRow?.phone ?? null,
    refCode: profileError ? null : profileRow?.ref_code ?? null,
    role
  };
};

export const signInWithEmail = async (email: string, password: string): Promise<User> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Sign in failed.');
  }
  return data.user;
};

export const signUpWithEmail = async (input: SignUpInput): Promise<User> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName
      }
    }
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? 'Sign up failed.');
  }

  if (!data.session) {
    return data.user;
  }

  await ensureProfileRow(data.user.id, {
    fullName: input.fullName,
    phone: input.phone
  });
  await ensureRoleRow(data.user.id);

  return data.user;
};

export const signOutCurrentUser = async () => {
  const supabase = requireSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};
