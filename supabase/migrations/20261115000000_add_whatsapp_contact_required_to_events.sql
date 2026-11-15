alter table public.events
  add column if not exists whatsapp_contact_required boolean not null default false;

notify pgrst, 'reload schema';
