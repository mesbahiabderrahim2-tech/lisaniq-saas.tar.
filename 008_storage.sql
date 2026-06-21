-- ══════════════════════════════════════════════════════════════
-- LisanIQ — Migration 008: Storage Configuration
-- Creates the datasets bucket and enforces per-user isolation.
-- File path convention: {owner_id}/datasets/{dataset_id}/{filename}
-- ══════════════════════════════════════════════════════════════

-- Create the datasets storage bucket (private — no public URLs)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'datasets',
  'datasets',
  false,                    -- no public access
  26214400,                 -- 25 MB limit per file
  array[
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/octet-stream'  -- some CSV uploads arrive with this type
  ]
)
on conflict (id) do update
  set file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Storage RLS Policies ────────────────────────────────────
-- Users may only access files under their own owner_id prefix.
-- Path structure: {owner_id}/datasets/{dataset_id}/{filename}

create policy "storage: users read own files"
  on storage.objects for select
  using (
    bucket_id = 'datasets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "storage: users upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'datasets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
    and array_length(string_to_array(name, '/'), 1) = 4
    -- Enforce path depth: owner_id/datasets/dataset_id/filename
  );

create policy "storage: users delete own files"
  on storage.objects for delete
  using (
    bucket_id = 'datasets'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

-- No UPDATE policy — files are write-once, delete-and-replace for updates
