create table if not exists coupons (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value numeric not null,
  min_spend numeric default 0,
  usage_limit integer,
  used_count integer default 0,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Enable RLS
alter table coupons enable row level security;

-- Policies
create policy "Public read access for active coupons"
  on coupons for select
  using (true);

create policy "Admin full access"
  on coupons for all
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
