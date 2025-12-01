-- Create 'slips' bucket
insert into storage.buckets (id, name, public) 
values ('slips', 'slips', true)
on conflict (id) do nothing;

-- Policy: Public can upload slips (authenticated users)
create policy "Authenticated users can upload slips"
on storage.objects for insert
with check ( bucket_id = 'slips' and auth.role() = 'authenticated' );

-- Policy: Public can view slips (needed for admin verification)
create policy "Public can view slips"
on storage.objects for select
using ( bucket_id = 'slips' );
