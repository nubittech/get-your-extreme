import { requireSupabase, SUPABASE_QR_TABLE } from './supabase';
import { QrCodeRecord, QrCodeUpsertInput } from '../types/qr';

const mapQrRow = (row: Record<string, unknown>): QrCodeRecord => ({
  id: String(row.id ?? ''),
  key: String(row.key ?? ''),
  url: String(row.url ?? ''),
  dataUrl: String(row.data_url ?? row.dataUrl ?? ''),
  updatedAt: String(row.updated_at ?? row.updatedAt ?? new Date().toISOString())
});

export const fetchQrCode = async (key: string): Promise<QrCodeRecord | null> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from(SUPABASE_QR_TABLE)
    .select('*')
    .eq('key', key)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Supabase QR fetch failed: ${error.message}`);
  }

  if (!data) return null;
  return mapQrRow(data as Record<string, unknown>);
};

export const upsertQrCode = async (input: QrCodeUpsertInput): Promise<QrCodeRecord> => {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from(SUPABASE_QR_TABLE)
    .upsert(
      {
        key: input.key,
        url: input.url,
        data_url: input.dataUrl,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    )
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Supabase QR upsert failed: ${error?.message ?? 'Unknown error'}`);
  }

  return mapQrRow(data as Record<string, unknown>);
};
