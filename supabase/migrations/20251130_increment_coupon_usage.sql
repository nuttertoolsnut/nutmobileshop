create or replace function increment_coupon_usage(coupon_code text)
returns void as $$
begin
  update coupons
  set used_count = used_count + 1
  where code = coupon_code;
end;
$$ language plpgsql security definer;
