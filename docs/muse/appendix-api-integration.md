# appendix. API Integration

> Phase 4 (Client Integration) + Phase 5 (Verify) 통합 부록.
> 단계별로 4a (인프라), 4b (인증 치환), 5 (푸시 + 검증) 로 쪼개서 진행.

## 진행 상태

| 단계 | 산출 | 상태 |
|---|---|---|
| 4a. 인프라 | supabase-js 설치, lib/types/utils, Storage bucket 마이그레이션 | ✅ 완료 |
| 4b. 인증 치환 | stub AuthProvider 삭제 + 실 supabase 기반 useAuth/useSignIn/useSignUp | ✅ 완료 |
| 5. 푸시 + 검증 | supabase db push (4 마이그레이션 일괄) + 검증 SQL + 가입 스모크 | ✅ 완료 (2026-05-02) |
| 4c (보류). museStore → Supabase | references / projects / analysis 데이터 훅 wiring | ⏸ 차후 사이클 |

## 4a. 인프라 (완료)

### 패키지

```
pnpm add @supabase/supabase-js   # 2.105.1
```

### 신규 파일

| 파일 | 역할 |
|---|---|
| `src/lib/supabase.js` | createClient singleton (`persistSession + autoRefreshToken`). VITE_SUPABASE_URL/ANON_KEY 미설정 시 throw |
| `src/types/database.js` | 6 테이블 row + NormalizedError JSDoc typedef. appendix-db-schema.md 와 1:1 |
| `src/utils/errorMessages.js` | Auth / PostgREST / Network / Storage 영문 메시지·코드 → 한국어 매핑 |
| `src/utils/supabaseError.js` | `normalizeSupabaseError(error)` → `{ message, code }` |

### 신규 마이그레이션

`supabase/migrations/20260502062931_storage_references.sql`:

- `references` bucket 생성 (public=false, 10MB, image/* mime 제한)
- `storage.objects` RLS 정책 4개 (SELECT/INSERT/UPDATE/DELETE) — **owner 폴더 규칙: `{auth.uid()}/{filename}`**

### 객체 경로 규칙

업로드 시 클라이언트가 다음 형식으로 경로 지정:

```js
const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
await supabase.storage.from('references').upload(path, file);
```

→ Storage RLS 가 첫 폴더 = auth.uid() 검증.

### thumbnail_url 채움 전략

- source = 'file': `getPublicUrl` (public=false 버킷이므로 실제로는 signed URL 권장) 또는 `createSignedUrl(path, ttl)` 결과를 `reference_items.thumbnail_url` 에 저장.
- source = 'url': 외부 URL 그대로.

> **note**: public=false bucket 의 getPublicUrl 은 토큰 없이 못 봄. signed URL TTL 정책은 4c (museStore 마이그레이션) 에서 결정. 현재는 bucket 만 준비.

## 4b. 인증 치환 (완료)

### 삭제

- `src/hooks/auth/AuthContext.jsx` (localStorage stub)
- `src/hooks/auth/authContextValue.js`
- `src/hooks/auth/useAuthContext.js`

→ supabase.auth 가 이미 singleton 이라 별도 React Context 불필요.

### 재작성

- `src/hooks/auth/useAuth.js`: `supabase.auth.getSession()` + `onAuthStateChange` 구독. `{ user, session, loading, signOut }`.
- `src/hooks/auth/useSignIn.js`: `supabase.auth.signInWithPassword({ email, password })` + `normalizeSupabaseError`. 에러는 한국어로.
- `src/hooks/auth/useSignUp.js`: `supabase.auth.signUp({ email, password, options: { data: { display_name } } })`. handle_new_user 트리거가 raw_user_meta_data.display_name 을 읽어 profiles 채움.

### LoginForm / SignUpForm / AuthGuard 시그니처 유지

```jsx
// 변화 없음
const { signIn, loading, error } = useSignIn();
const { user, loading } = useAuth();
```

→ UI 컴포넌트 코드 변경 0.

### App.jsx 변경

- `<AuthProvider>` 래퍼 제거 (1단계 안쪽에 있던 wrapper 한 줄)
- 라우팅 / 보호 라우트 / AuthGuard 그대로

### Storybook 영향

- `<AuthProvider initialUser=...>` decorator 가 더 이상 존재하지 않음 → 4 stories 의 wrapper 제거
- 스토리는 시각 검증용. 폼 제출 시 supabase.auth 가 실제 호출 시도하므로 클릭 권장 안 함
- AuthGuard 의 Authenticated/Unauthenticated 분기 스토리 → 단일 Default 스토리로 통합 (실 세션 상태 의존)

### 빌드 영향

- bundle: 935 kB → 1140 kB (supabase-js 포함)
- 빌드 통과 확인됨

## 5. 푸시 + 검증 (대기)

### Dashboard 사전 조건 (본인 직접)

- Auth → Providers → Email Enabled
- Auth → Sign In/Up → Confirm email **OFF**
- Auth → URL Configuration → Site URL `http://localhost:5173`, Redirect URLs `http://localhost:5173/*`
- Auth → Password → Min length 8

### dry-run

```
! supabase db diff --linked
```

→ 4 마이그레이션 (init_schema / auth_profiles / rls_policies / storage_references) 의 누적 변화 미리보기.

### 푸시

```
! supabase db push
```

순서: 타임스탬프 순으로 자동 적용.

### MCP 검증 SQL (본인 DB 에 적용 후)

1. RLS 활성화 누락 검사 (반드시 0건):
   ```sql
   select tablename from pg_tables
   where schemaname = 'public' and rowsecurity = false;
   ```
2. 정책 없는 RLS 활성 테이블 (반드시 0건):
   ```sql
   select c.relname from pg_class c
   left join pg_policy p on p.polrelid = c.oid
   where c.relnamespace = 'public'::regnamespace
     and c.relrowsecurity = true and p.polname is null;
   ```
3. 정책 카탈로그:
   ```sql
   select tablename, policyname, cmd, roles
   from pg_policies where schemaname = 'public'
   order by tablename, cmd;
   ```
4. updated_at 트리거 누락 검사 (반드시 0건):
   ```sql
   select c.table_name from information_schema.columns c
   where c.table_schema = 'public' and c.column_name = 'updated_at'
     and not exists (
       select 1 from information_schema.triggers t
       where t.event_object_schema = c.table_schema
         and t.event_object_table = c.table_name
         and t.action_statement ilike '%set_updated_at%'
     );
   ```
5. Storage bucket / 정책:
   ```sql
   select id, name, public, file_size_limit from storage.buckets where id = 'references';
   select policyname, cmd from pg_policies where schemaname='storage' and tablename='objects';
   ```

### 가입 스모크 (4b 끝난 직후)

1. dev 서버 → / → 시작하기 → 가입 → /archive 이동
2. MCP: `select id, email from auth.users order by created_at desc limit 1;`
3. MCP: `select id, display_name from public.profiles where id = '<above id>';` → 1행
4. MCP: `select id, ai_model from public.user_settings where id = '<above id>';` → 1행 (default 값)

→ 트리거 정상 동작 확인.

## 보안 체크

- [x] `.env.local` 에 service_role 없음 (anon key + MCP_TOKEN 만)
- [x] `.gitignore` 에 `.env.*` 등록
- [ ] Phase 5 후 dist 빌드 → `grep "service_role"` 0건 확인
- [ ] Phase 5 후 MCP 가 read-only 인지 재확인 (`claude mcp list`)

## 참조

- [04-data-bridge.md](./04-data-bridge.md) (페이지/테이블 매핑)
- [appendix-db-schema.md](./appendix-db-schema.md) (테이블 DDL)
- [appendix-auth-design.md](./appendix-auth-design.md) (handle_new_user 트리거)
- [appendix-rls-policies.md](./appendix-rls-policies.md) (RLS 정책)
- `src/lib/supabase.js`, `src/types/database.js`, `src/utils/supabaseError.js`
