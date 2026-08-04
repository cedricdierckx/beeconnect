insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

create policy "Lecture publique des avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Un utilisateur peut téléverser son propre avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Un utilisateur peut modifier son propre avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Un utilisateur peut supprimer son propre avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Lecture publique des images de publication"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Un utilisateur peut téléverser ses propres images de publication"
  on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Un utilisateur peut supprimer ses propres images de publication"
  on storage.objects for delete
  using (bucket_id = 'post-images' and auth.uid()::text = (storage.foldername(name))[1]);
