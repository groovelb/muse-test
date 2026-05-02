-- 4c-A: references Storage 통합 보조 마이그레이션
-- 1) reference_items.storage_path 컬럼 추가 (delete 시 Storage 객체 삭제 키)
-- 2) references bucket public=true 로 변경 (썸네일을 <img src> 직접 노출용)
--    - 보안: path 의 첫 폴더 = auth.uid() 규칙 + UUID 파일명으로 추측 불가
--    - WRITE/DELETE 는 여전히 Storage RLS 가 owner-only 강제

-- 컬럼 추가
alter table public.reference_items
  add column if not exists storage_path text;

-- bucket public 화
update storage.buckets
set public = true
where id = 'references';
