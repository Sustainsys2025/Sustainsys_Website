-- Job applications and contact messages captured by the public website.
-- Written by the submit-application Edge Function (service role only).

create table if not exists public.job_applications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  position         text not null,
  reference        text,
  full_name        text not null,
  email            text not null,
  phone            text,
  current_location text,
  in_uk            text,
  right_to_work    text,
  driving_licence  text,
  availability     text,
  covering_note    text,
  cv_path          text,
  cv_filename      text,
  cv_size_bytes    integer,
  consent          boolean not null default false,
  source           text not null default 'careers-form',
  user_agent       text,
  status           text not null default 'received',   -- received | shortlisted | interviewed | rejected | withdrawn | hired
  notes            text
);

create index if not exists job_applications_created_at_idx on public.job_applications (created_at desc);
create index if not exists job_applications_position_idx   on public.job_applications (position);

create table if not exists public.contact_messages (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  inquiry_type text,
  full_name    text not null,
  email        text not null,
  phone        text,
  message      text not null,
  source       text not null default 'contact-form',
  user_agent   text,
  handled      boolean not null default false
);

-- Lock both tables down: no anon/authenticated access. The Edge Function uses the service role.
alter table public.job_applications enable row level security;
alter table public.contact_messages  enable row level security;
revoke all on public.job_applications from anon, authenticated;
revoke all on public.contact_messages  from anon, authenticated;

-- Private bucket for CVs (5 MB, PDF/Word only). No public policies: service role only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applications', 'applications', false, 5242880,
  array['application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
