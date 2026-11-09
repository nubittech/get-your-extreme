-- Run once in the Supabase SQL Editor for an existing project.
alter table public.events alter column time drop not null;
alter table public.events alter column price drop not null;
alter table public.events
  add column if not exists whatsapp_contact_required boolean not null default false;
