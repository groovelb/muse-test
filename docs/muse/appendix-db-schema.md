# appendix. DB Schema

> [04-data-bridge.md § 1.5](./04-data-bridge.md) 의 컬럼 표를 PostgreSQL DDL 로 변환.
> RLS 정책은 [appendix-rls-policies.md](./appendix-rls-policies.md), 인증 트리거는 [appendix-auth-design.md](./appendix-auth-design.md).

## 개요

- 프로젝트: muse
- 총 테이블 수: 6 (profiles, user_settings, reference_items, projects, project_references, analysis_results)
- 작성일: 2026-05-02
- 마이그레이션: `supabase/migrations/20260502055752_init_schema.sql`

## ERD

```mermaid
erDiagram
    "auth.users" ||--|| profiles : "1:1 (id=id)"
    "auth.users" ||--|| user_settings : "1:1 (id=id)"
    "auth.users" ||--o{ reference_items : "owns"
    "auth.users" ||--o{ projects : "owns"
    projects ||--o{ project_references : "has"
    reference_items ||--o{ project_references : "used in"
    projects ||--|| analysis_results : "1:1 latest"

    profiles {
        uuid id PK_FK
        text display_name
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }
    user_settings {
        uuid id PK_FK
        text ai_model
        text storage_mode
        text theme_mode
        boolean is_auto_tag_enabled
        timestamptz created_at
        timestamptz updated_at
    }
    reference_items {
        uuid id PK
        uuid owner_id FK
        text source
        text thumbnail_url
        text title
        jsonb tags
        text_array dominant_colors
        jsonb extracted
        timestamptz created_at
    }
    projects {
        uuid id PK
        uuid owner_id FK
        text name
        text mode
        text intent
        text user_notes
        jsonb reference_notes
        timestamptz created_at
        timestamptz updated_at
    }
    project_references {
        uuid id PK
        uuid project_id FK
        uuid reference_id FK
        text_array use_layers
    }
    analysis_results {
        uuid id PK
        uuid project_id FK
        text status
        jsonb layers
        timestamptz updated_at
    }
```

## 공통 규칙

- **PK**: 모든 테이블 `uuid` (`gen_random_uuid()`). 단 `profiles` / `user_settings` 는 `auth.users(id)` 직접 참조 (1:1).
- **timestamps**: `created_at`, `updated_at` 모두 `timestamptz not null default now()`.
- **`updated_at` 트리거**: `set_updated_at()` BEFORE UPDATE 부착 (profiles / user_settings / projects / analysis_results).
- **삭제 정책**: 모두 hard delete. soft delete 없음.
- **FK on delete**: 대부분 `cascade` (소유자 / 부모 삭제 시 자식 함께 삭제).
- **RLS**: 모든 테이블 `enable row level security`. 정책 자체는 `appendix-rls-policies.md` (Phase 3) 에서.

## 테이블 상세

### profiles (auth.users 확장)

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id ON DELETE CASCADE | 사용자 ID (1:1) |
| display_name | text | NULLABLE | GNB 표시 이름 |
| avatar_url | text | NULLABLE | 프로필 이미지 URL |
| created_at | timestamptz | default now() | 가입일 (= auth.users.created_at) |
| updated_at | timestamptz | default now(), trigger | 프로필 수정 시각 |

**트리거**: `set_updated_at` BEFORE UPDATE
**가입 자동화**: `handle_new_user` 트리거 (Phase 2 에서 추가) 가 `auth.users` insert 직후 빈 profile row 자동 생성.

### user_settings (사용자당 1 row)

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK, FK → auth.users.id ON DELETE CASCADE | 사용자 ID (1:1) |
| ai_model | text | NOT NULL, default `'claude-sonnet-4-6'` | T1/T2/T3 호출에 쓰는 모델명 |
| storage_mode | text | NOT NULL, CHECK (local / cloud), default `'cloud'` | 데이터 저장 위치 |
| theme_mode | text | NOT NULL, CHECK (light / dark / system), default `'system'` | 화면 테마 |
| is_auto_tag_enabled | boolean | NOT NULL, default `true` | 업로드 시 자동 태깅 동작 여부 |
| created_at | timestamptz | default now() | 생성 시각 |
| updated_at | timestamptz | default now(), trigger | 수정 시각 |

**트리거**: `set_updated_at` BEFORE UPDATE
**가입 자동화**: `handle_new_user` 트리거 (Phase 2) 가 default 값으로 row 자동 생성.

### reference_items

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | |
| owner_id | uuid | NOT NULL, FK → auth.users.id ON DELETE CASCADE | 소유자 |
| source | text | NOT NULL, CHECK (file / url) | 입력 소스 유형 |
| thumbnail_url | text | NOT NULL | source=file 일 때는 Storage public URL, source=url 일 때는 외부 URL |
| title | text | NULLABLE | 사용자 지정 제목 |
| tags | jsonb | NULLABLE | 레이어별 태그 묶음 (T1 자동 태깅 결과) |
| dominant_colors | text[] | NULLABLE | 대표 HEX 1~5개 |
| extracted | jsonb | NULLABLE | T1 자동 태깅 관찰 값 (palette / typography / layout / gradient) |
| created_at | timestamptz | default now() | |

**인덱스**: `idx_reference_items_owner_id (owner_id)`, `idx_reference_items_created_at (created_at desc)`

### projects

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| owner_id | uuid | NOT NULL, FK → auth.users.id ON DELETE CASCADE | 소유자 |
| name | text | NOT NULL | 프로젝트 이름 |
| mode | text | NOT NULL, CHECK (concept / system) | 위자드 모드 |
| intent | text | NULLABLE | 한 줄 의도 (Step 1) |
| user_notes | text | NULLABLE | Step 3 활용 노트 |
| reference_notes | jsonb | NULLABLE | { refId: 텍스트 } (≤100자) |
| created_at | timestamptz | default now() | |
| updated_at | timestamptz | default now(), trigger | |

**인덱스**: `idx_projects_owner_id (owner_id)`, `idx_projects_created_at (created_at desc)`
**트리거**: `set_updated_at` BEFORE UPDATE

### project_references (M:N 매핑)

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| project_id | uuid | NOT NULL, FK → projects.id ON DELETE CASCADE | 소속 프로젝트 |
| reference_id | uuid | NOT NULL, FK → reference_items.id ON DELETE CASCADE | 큐레이션된 레퍼런스 |
| use_layers | text[] | NOT NULL, default `'{}'` | color / typography / layout / gradient / visualDirection. 빈 배열 = 자동 (T2 추천) |

**유니크**: `(project_id, reference_id)` 같은 레퍼런스 중복 큐레이션 방지
**인덱스**: `idx_project_references_project_id`, `idx_project_references_reference_id`

### analysis_results

| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | uuid | PK | |
| project_id | uuid | NOT NULL, FK → projects.id ON DELETE CASCADE | 소속 프로젝트 |
| status | text | NOT NULL, CHECK (pending / running / done / error), default `'pending'` | 분석 진행 상태 |
| layers | jsonb | NOT NULL, default `'{}'::jsonb` | 5 레이어 토큰 묶음. 각 토큰의 label / isEnabled / emphasis / sourceReferenceIds / decisionRationale 모두 포함 |
| updated_at | timestamptz | default now(), trigger | 마지막 토큰 편집 시각 |

**인덱스**: `idx_analysis_results_project_id (project_id)`
**트리거**: `set_updated_at` BEFORE UPDATE

> 하나의 project 에 여러 분석 결과를 보존하고 싶다면 (재분석 히스토리) status / id 만으로 구분. 현재 UX 는 "최신 1 row" 만 사용.

## ON DELETE 정책 매트릭스

| 부모 삭제 | 영향받는 자식 | 동작 |
|---|---|---|
| `auth.users` (사용자 탈퇴) | profiles / user_settings / reference_items / projects | 모두 CASCADE → 사용자 데이터 통째 삭제 |
| `projects` | project_references / analysis_results | CASCADE |
| `reference_items` | project_references | CASCADE (해당 프로젝트의 큐레이션에서 자동 제거) |

> **주의**: `analysis_results.layers.{layer}.tokens[*].sourceReferenceIds` 는 jsonb 내부 배열이라 FK 가 아님. reference_items 가 삭제되면 jsonb 안의 reference id 는 dangling 됨. 클라이언트가 표시 시 "삭제된 레퍼런스" 로 graceful fallback 필요. (data-bridge 합의됨)

## 마이그레이션 파일

- `supabase/migrations/20260502055752_init_schema.sql` (Phase 1, 본 문서)
- 다음 예정:
  - `{ts}_auth_profiles.sql` (Phase 2, handle_new_user 트리거)
  - `{ts}_rls_policies.sql` (Phase 3)

## 적용 방법

Phase 5 (검증 단계) 에서 일괄 적용:

```
! supabase db push
```

push 전에 다음 스크립트로 dry-run 권장:

```
! supabase db diff --linked
```

## 참조

- [04-data-bridge.md](./04-data-bridge.md) § 1.5 (단일 진실 원천)
- [appendix-auth-design.md](./appendix-auth-design.md) (Phase 2)
- [appendix-rls-policies.md](./appendix-rls-policies.md) (Phase 3)
