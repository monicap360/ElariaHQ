-- Add parking sites to site_target enum.
do $$
begin
  if not exists (select 1 from pg_enum where enumlabel = 'pier10parking' and enumtypid = 'site_target'::regtype) then
    alter type public.site_target add value 'pier10parking';
  end if;
  if not exists (select 1 from pg_enum where enumlabel = 'pier25parking' and enumtypid = 'site_target'::regtype) then
    alter type public.site_target add value 'pier25parking';
  end if;
end $$;
