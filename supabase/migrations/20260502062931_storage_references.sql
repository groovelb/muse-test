-- MUSE Storage: references bucket
-- 사용자 업로드 이미지 (reference_items.source = 'file') 의 원본/썸네일 보관.
-- url 소스 (외부 URL) 는 Storage 미사용.
--
-- 정책 합의:
-- - public bucket = false (인증된 사용자만 접근)
-- - 객체 경로 규칙: {auth.uid()}/{filename} → owner-only RLS 강제
-- - signed URL 또는 자체 path 추출로 owner 확인
--
-- public 노출이 필요한 경우 thumbnail_url 컬럼에 createSignedUrl 결과 또는
-- public bucket 으로 별도 마이그레이션. 현재는 보안 우선.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'references',
  'references',
  false,
  10 * 1024 * 1024,  -- 10MB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- =============================================================================
-- Storage RLS 정책 (storage.objects 테이블에 대한 정책)
-- =============================================================================

-- 사용자 본인 폴더 ({auth.uid()}/...) 만 SELECT
create policy "references_select_own_folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 사용자 본인 폴더에만 INSERT
create policy "references_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 사용자 본인 폴더만 UPDATE (메타데이터 변경 등)
create policy "references_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 사용자 본인 폴더만 DELETE
create policy "references_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'references'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
