# appendix. RLS Policies

> [04-data-bridge.md § 3 페이지 → 테이블](./04-data-bridge.md) 의 R/W 권한을 PostgreSQL Row Level Security 정책으로 변환.
> 정책은 [appendix-db-schema.md](./appendix-db-schema.md) 의 `enable row level security` 위에서 동작.

## 합의 결과

| 항목 | 값 | 출처 |
|---|---|---|
| Reference / Project 소유 | owner-only | Phase 0.5 Q1, Q2 |
| profiles SELECT | self-only (Q1=C) | Phase 3 Q1 |
| user_settings | 사용자당 1 row, self-only | Phase 0.5 Q5 |
| analysis_results | 부모 projects owner 검증 | data-bridge § 1.5 |
| project_references | 부모 projects owner 검증 | M:N 매핑 |

## 핵심 원칙

1. **DENY by default**: init_schema 에서 모든 테이블 RLS enable 완료. 정책 미정의 = 모든 접근 차단.
2. **동사별 분리**: SELECT / INSERT / UPDATE / DELETE 각각 정책. UPDATE 는 `using` + `with check` 둘 다.
3. **`to authenticated`**: 비로그인 사용자 차단 (anon 키만으로는 read/write 불가).
4. **자식 테이블은 helper 함수 경유**: project_references / analysis_results 는 직접 owner_id 가 없음. helper `is_project_owner(uuid)` 가 부모 projects 의 owner 를 검증.
5. **`security definer` 우회**: handle_new_user 트리거가 profiles INSERT 를 담당하므로 profiles 에는 INSERT 정책 불필요.

## helper 함수

```sql
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
```

- `security definer`: RLS 재귀 방지. 내부 SELECT 가 다시 RLS 를 거치면 무한 루프.
- `stable`: 같은 트랜잭션 안에서 결과 캐시 가능 → 쿼리 플래너 최적화.
- `set search_path = public`: SQL injection 방어.

## 정책 카탈로그

### profiles (Q1=C: self-only)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `profiles_select_self` | `auth.uid() = id` |
| INSERT | (없음) | handle_new_user 트리거 전용 |
| UPDATE | `profiles_update_self` | `auth.uid() = id` (using + with check) |
| DELETE | (없음) | auth.users CASCADE |

### user_settings (self-only)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `user_settings_select_self` | `auth.uid() = id` |
| INSERT | `user_settings_insert_self` | `auth.uid() = id` (with check). 트리거가 default 생성하지만 사용자도 직접 upsert 가능 |
| UPDATE | `user_settings_update_self` | `auth.uid() = id` |
| DELETE | (없음) | auth.users CASCADE |

### reference_items (owner-only)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `reference_items_select_own` | `auth.uid() = owner_id` |
| INSERT | `reference_items_insert_own` | `auth.uid() = owner_id` |
| UPDATE | `reference_items_update_own` | `auth.uid() = owner_id` (using + with check) |
| DELETE | `reference_items_delete_own` | `auth.uid() = owner_id` |

### projects (owner-only)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `projects_select_own` | `auth.uid() = owner_id` |
| INSERT | `projects_insert_own` | `auth.uid() = owner_id` |
| UPDATE | `projects_update_own` | `auth.uid() = owner_id` |
| DELETE | `projects_delete_own` | `auth.uid() = owner_id` |

### project_references (자식, helper 경유)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `project_references_select_via_project` | `is_project_owner(project_id)` |
| INSERT | `project_references_insert_via_project` | `is_project_owner(project_id)` |
| UPDATE | `project_references_update_via_project` | `is_project_owner(project_id)` |
| DELETE | `project_references_delete_via_project` | `is_project_owner(project_id)` |

### analysis_results (자식, helper 경유)

| 동작 | 정책명 | 조건 |
|---|---|---|
| SELECT | `analysis_results_select_via_project` | `is_project_owner(project_id)` |
| INSERT | `analysis_results_insert_via_project` | `is_project_owner(project_id)` |
| UPDATE | `analysis_results_update_via_project` | `is_project_owner(project_id)` |
| DELETE | `analysis_results_delete_via_project` | `is_project_owner(project_id)` |

## 페이지 ↔ 정책 매트릭스

[04-data-bridge.md § 3](./04-data-bridge.md) 의 페이지별 R/W 가 어떤 정책으로 강제되는지 역추적.

| 페이지 | 동작 | 적용 정책 |
|---|---|---|
| Auth | profiles/user_settings W (가입 트리거) | 트리거 security definer 로 RLS 우회 |
| Archive | reference_items W + R | reference_items_*_own |
| ProjectList | projects R | projects_select_own |
| ProjectCreate | projects W, project_references W, analysis_results W, reference_items R | projects_*_own + project_references_*_via_project + analysis_results_*_via_project + reference_items_select_own |
| ProjectDetail | analysis_results R + W (편집), projects R, reference_items R | analysis_results_*_via_project + projects_select_own + reference_items_select_own |
| Settings | user_settings R + W | user_settings_*_self |

## 검증 SQL (Phase 5 에서 MCP 로 실행)

### 1. RLS 활성화 누락 검사 (반드시 0건)

```sql
select tablename
from pg_tables
where schemaname = 'public' and rowsecurity = false;
```

### 2. 정책 없는 RLS 활성 테이블 검사 (반드시 0건)

```sql
select c.relname
from pg_class c
left join pg_policy p on p.polrelid = c.oid
where c.relnamespace = 'public'::regnamespace
  and c.relrowsecurity = true
  and p.polname is null;
```

### 3. 정책 카탈로그 확인

```sql
select schemaname, tablename, policyname, cmd, roles
from pg_policies
where schemaname = 'public'
order by tablename, cmd;
```

### 4. anon 키 시뮬레이션 (음성 케이스: 읽기 차단 확인)

Phase 5 에서 anon 키로 fetch 시도 → 빈 배열 / 401 이 와야 정상.

```sql
-- service_role / superuser 컨텍스트에서 시뮬레이션
set role anon;
select * from public.reference_items;  -- 0 행이 나와야 함
reset role;
```

## 마이그레이션 파일

- `supabase/migrations/20260502062350_rls_policies.sql`

## 적용 순서

Phase 5 에서 일괄 적용:

```
! supabase db push
```

순서:
1. `20260502055752_init_schema.sql` (테이블 + RLS enable)
2. `20260502060519_auth_profiles.sql` (handle_new_user 트리거)
3. `20260502062350_rls_policies.sql` (이 문서)

## 참조

- [04-data-bridge.md](./04-data-bridge.md) § 3 페이지/테이블 (단일 진실 원천)
- [appendix-db-schema.md](./appendix-db-schema.md) (테이블 / RLS enable)
- [appendix-auth-design.md](./appendix-auth-design.md) (handle_new_user 트리거)
- [appendix-api-integration.md](./appendix-api-integration.md) (Phase 4·5 검증)
