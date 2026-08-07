begin;

drop policy if exists "admins insert product images" on storage.objects;
create policy "admins insert product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = 'admin'
  and (select public.is_current_user_admin())
);

commit;
