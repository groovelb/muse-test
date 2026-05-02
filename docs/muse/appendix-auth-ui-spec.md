# appendix. Auth UI Spec (MUSE)

> `/component-work` 의 입력 사양. component-work 가 이 파일을 Read 해서 컴포넌트 + 스토리 자동 생성.
> 사용자 호출: `/component-work LoginForm SignUpForm AuthGuard`

## 공통 전제

- 인증 방식: Email + Password (Confirm email OFF)
- Supabase client: `src/lib/supabase.js` (Phase 4 에서 생성)
- 인증 훅: `src/hooks/auth/` (Phase 4 에서 생성)
- 상태 표현: loading / error / success
- 디자인 토큰 / MUI sx 우선 (CLAUDE.md `design-system.md` 준수)
- 라우팅: react-router-dom v7

## 컴포넌트 목록

### 1. LoginForm

| 항목 | 값 |
|---|---|
| 카테고리 | `input` |
| 경로 | `src/components/input/LoginForm.jsx` |
| 소비할 훅 | `useSignIn` (`src/hooks/auth/useSignIn.js`) |
| 사용 페이지 | `/auth` (Auth) |

**필드**:
- `email` (text, required, type=email)
- `password` (text, required, type=password, minLength=8)

**상태**:
- `idle` → 폼 입력 가능
- `loading` → 버튼 disabled + Spinner
- `error` → 폼 위 Alert 컴포넌트로 한국어 메시지 (error-catalog 사용)
- `success` → `onSignedIn` 콜백 호출 (라우팅은 부모가 담당)

**Props**:
- `onSignedIn` (function, optional): 로그인 성공 콜백
- `onSwitchToSignUp` (function, optional): "회원가입으로" 링크 클릭 콜백

**예시 사용**:
```jsx
<LoginForm
  onSignedIn={() => navigate('/archive')}
  onSwitchToSignUp={() => setMode('signup')}
/>
```

**Storybook 스토리 요구사항**:
- `Default` (idle)
- `Loading` (mock loading=true)
- `Error` (mock error='이메일 또는 비밀번호가 올바르지 않습니다')

---

### 2. SignUpForm

| 항목 | 값 |
|---|---|
| 카테고리 | `input` |
| 경로 | `src/components/input/SignUpForm.jsx` |
| 소비할 훅 | `useSignUp` (`src/hooks/auth/useSignUp.js`) |
| 사용 페이지 | `/auth` (Auth) |

**필드**:
- `email` (text, required, type=email)
- `password` (text, required, type=password, minLength=8, helperText="8자 이상")
- `passwordConfirm` (text, required, 일치 검증)

**상태**:
- `idle` / `loading` / `error` / `success`
- 성공 시 (Confirm email OFF 이므로) 즉시 로그인 → `onSignedUp` 콜백 호출

**Props**:
- `onSignedUp` (function, optional): 가입 성공 콜백
- `onSwitchToLogin` (function, optional): "로그인으로" 링크 클릭 콜백

**Storybook 스토리 요구사항**:
- `Default` / `Loading` / `Error` (이미 가입된 이메일 시나리오)

---

### 3. AuthGuard

| 항목 | 값 |
|---|---|
| 카테고리 | `layout` |
| 경로 | `src/components/layout/AuthGuard.jsx` |
| 소비할 훅 | `useAuth` (`src/hooks/auth/useAuth.js`) |
| 사용 페이지 | App router 의 보호 라우트 wrapper |

**역할**:
- `useAuth` 로 user 확인
- user=null + 세션 로딩 중 → `LoadingIndicator` 표시
- user=null + 로딩 완료 → `<Navigate to="/auth" replace />`
- user=있음 → `children` 렌더

**Props**:
- `children` (node, required)
- `redirectTo` (string, optional, default `/auth`)

**예시 사용**:
```jsx
<Route element={<AuthGuard><AppShell /></AuthGuard>}>
  <Route path="/" element={<Archive />} />
  <Route path="/projects" element={<ProjectList />} />
</Route>
```

**Storybook 스토리 요구사항**:
- `Authenticated` (mock user=세션 있음 → children 렌더)
- `Unauthenticated` (mock user=null → 리다이렉트 placeholder)
- `Loading` (mock 세션 로딩 중)

---

## 훅 사양 요약 (Phase 4 에서 구현)

| 훅 | 시그니처 | 반환 |
|---|---|---|
| `useSignIn` | `({ client })` | `{ signIn(email, password), loading, error }` |
| `useSignUp` | `({ client })` | `{ signUp(email, password, displayName?), loading, error }` |
| `useAuth` | `({ client })` | `{ user, session, loading, signOut() }` |

> `{ client }` 파라미터 주입 패턴: Storybook 에서 mock client 주입 가능 (CLAUDE.md `Storybook 호환` 원칙).

## 참조

- [appendix-auth-design.md](./appendix-auth-design.md) (트리거 SQL / Dashboard / 플로우)
- [appendix-api-integration.md](./appendix-api-integration.md) (Phase 4 훅 구현)
- CLAUDE.md `design-system.md` (디자인 토큰 / MUI sx 우선)
