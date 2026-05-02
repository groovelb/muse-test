-- MUSE RLS policies
-- 전제: init_schema 에서 모든 테이블 enable row level security 완료
-- 합의: 모든 사용자 데이터 owner-only. profiles SELECT = self only (Q1=C)

-- =============================================================================
-- 0. helper: 현재 사용자가 특정 project 의 owner 인지 확인
-- =============================================================================

create or replace function public.is_project_owner(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.projects
    where id = p_project_id and owner_id = auth.uid()
  );
$$;

-- =============================================================================
-- 1. profiles  (Q1=C: self-only SELECT, INSERT 트리거 전용, DELETE 없음 = CASCADE)
-- =============================================================================

create policy "profiles_select_self"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT 정책 없음 (handle_new_user 트리거 security definer 로 우회)
-- DELETE 정책 없음 (auth.users 삭제 시 CASCADE)

-- =============================================================================
-- 2. user_settings  (self-only 모든 동작)
-- =============================================================================

create policy "user_settings_select_self"
  on public.user_settings for select
  to authenticated
  using (auth.uid() = id);

create policy "user_settings_insert_self"
  on public.user_settings for insert
  to authenticated
  with check (auth.uid() = id);

create policy "user_settings_update_self"
  on public.user_settings for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- DELETE 정책 없음 (auth.users CASCADE)

-- =============================================================================
-- 3. reference_items  (owner-only 모든 동작)
-- =============================================================================

create policy "reference_items_select_own"
  on public.reference_items for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "reference_items_insert_own"
  on public.reference_items for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "reference_items_update_own"
  on public.reference_items for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "reference_items_delete_own"
  on public.reference_items for delete
  to authenticated
  using (auth.uid() = owner_id);

-- =============================================================================
-- 4. projects  (owner-only 모든 동작)
-- =============================================================================

create policy "projects_select_own"
  on public.projects for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using (auth.uid() = owner_id);

-- =============================================================================
-- 5. project_references  (자식: 부모 projects 의 owner 검증)
-- =============================================================================

create policy "project_references_select_via_project"
  on public.project_references for select
  to authenticated
  using (public.is_project_owner(project_id));

create policy "project_references_insert_via_project"
  on public.project_references for insert
  to authenticated
  with check (public.is_project_owner(project_id));

create policy "project_references_update_via_project"
  on public.project_references for update
  to authenticated
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "project_references_delete_via_project"
  on public.project_references for delete
  to authenticated
  using (public.is_project_owner(project_id));

-- =============================================================================
-- 6. analysis_results  (자식: 부모 projects 의 owner 검증)
-- =============================================================================

create policy "analysis_results_select_via_project"
  on public.analysis_results for select
  to authenticated
  using (public.is_project_owner(project_id));

create policy "analysis_results_insert_via_project"
  on public.analysis_results for insert
  to authenticated
  with check (public.is_project_owner(project_id));

create policy "analysis_results_update_via_project"
  on public.analysis_results for update
  to authenticated
  using (public.is_project_owner(project_id))
  with check (public.is_project_owner(project_id));

create policy "analysis_results_delete_via_project"
  on public.analysis_results for delete
  to authenticated
  using (public.is_project_owner(project_id));
