-- Add new columns for detailed variant management
alter table product_variants 
add column color text,
add column storage text,
add column price numeric;

-- Make name optional if it was not null (it was defined as 'text not null' in schema.sql)
alter table product_variants alter column name drop not null;
