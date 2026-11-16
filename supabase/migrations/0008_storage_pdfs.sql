-- ============================================================================
-- 0008_storage_pdfs.sql
-- Configura o bucket privado para PDFs dos usuários e aplica RLS no Storage.
-- ============================================================================

-- Cria o bucket se não existir (privado por padrão)
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', false)
on conflict (id) do nothing;

-- Políticas do Storage (tabela storage.objects)
-- O caminho do arquivo deve começar com o ID do usuário: ex: "uuid-do-user/arquivo.pdf"
-- O split_part pega o primeiro diretório e compara com o auth.uid().

drop policy if exists "pdfs_select_own" on storage.objects;
create policy "pdfs_select_own"
on storage.objects for select to authenticated
using (bucket_id = 'pdfs' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "pdfs_insert_own" on storage.objects;
create policy "pdfs_insert_own"
on storage.objects for insert to authenticated
with check (bucket_id = 'pdfs' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "pdfs_update_own" on storage.objects;
create policy "pdfs_update_own"
on storage.objects for update to authenticated
using (bucket_id = 'pdfs' and split_part(name, '/', 1) = auth.uid()::text)
with check (bucket_id = 'pdfs' and split_part(name, '/', 1) = auth.uid()::text);

drop policy if exists "pdfs_delete_own" on storage.objects;
create policy "pdfs_delete_own"
on storage.objects for delete to authenticated
using (bucket_id = 'pdfs' and split_part(name, '/', 1) = auth.uid()::text);