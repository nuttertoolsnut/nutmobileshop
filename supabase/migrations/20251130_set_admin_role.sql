-- Replace 'YOUR_EMAIL@EXAMPLE.COM' with your actual email address
update profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'nuttertoolsnut1@gmail.com'
);
