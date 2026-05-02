# Project Rules — Vibe Design Starter Kit (Start Point)

이 저장소는 **백엔드 미연동 상태의 학습 시작 키트**다. 학습자가 단계별로 Supabase 연동, 인증, 어드민 등을 직접 추가하면서 완성된 MUSE 앱으로 발전시킨다.

## Workflow

- 기획 문서 작성 → `/project-planning` Skill 이 워크플로우 담당
- 컴포넌트 작업 → `/component-work` Skill 이 워크플로우 담당
- 리팩토링 → `refactoring-guide.md` 참조, 기존 스토리 통과 확인
- 룰 수정 시 → `pnpm generate-rules` 실행하여 Storybook 시각화 동기화

## AI Slop 금지 (CRITICAL)

- **`—` (em dash) 절대 사용 금지**. 코드 / 카피 / 답변 / 문서 / 커밋 메시지 어디에서도 사용하지 않는다. 대시는 LLM 의 대표적 AI slop 신호. 대신 마침표, 쉼표, 콜론, 줄바꿈, 괄호 등 일반 구두점으로 대체.

## Reporting Rules (CRITICAL, 위반 금지)

- **있는 그대로 보고**. 축소·은폐 금지. 미비된 건 미비된 그대로 명시.
- "준비됨 = 작동함"으로 절대 동치시키지 않기. 시스템 프롬프트/스키마/함수 시그니처가 갖춰졌어도 호출 흐름에서 안 쓰이면 **"미작동"**으로 보고.
- 작업 완료 보고 시 반드시 다음 형식:
  - ✅ 준비된 것 (코드 존재)
  - ⚠️ 부분 작동 (일부만 통합)
  - ❌ 안 된 것 (UX/실제 호출에서 누락)
- 중간 단계에서 "잘 됐다"고 한 뒤 사용자가 물어봐서야 "사실 미작동이었다"고 번복하지 않기.
- "X 반영했다"고 말하기 전에: 데이터 모델 / 시스템 프롬프트 / 호출 시점 / UI 노출. 4계층 모두 통합됐는지 확인 후 보고.

## Current Status (Start Point)

### ✅ 포함된 것

- **컴포넌트 라이브러리 + Storybook**: `src/components/**` 전체 + 디자인 토큰 / 테마.
- **메인 라우터**: `/archive`, `/projects`, `/projects/new`, `/projects/:id`, `/settings`.
- **레퍼런스 업로드 흐름**: `ReferencePicker`, `useReferenceArchive`. 백엔드 미연동 상태 (메모리 dispatch 만).
- **프로젝트 생성 위자드**: `ProjectCreateWizard` 5-step (Step 0 모드 선택 → Step 4 분석).
- **T1/T2/T3 분석 템플릿**: `src/data/muse/aiTasks.js` 의 TASK_AUTO_TAG / TASK_RECOMMEND / TASK_ANALYZE_TOKENS / TASK_ANALYZE_CONCEPT 정의 + `src/utils/museAi.js`, `museAiTasks.js` 의 호출 헬퍼.
- **Anthropic API 직접 호출**: `museAi.callAnthropic` 이 `VITE_ANTHROPIC_API_KEY` 로 브라우저에서 직접 fetch (학습 전용).
- **MUSE 데이터 fixtures**: `src/data/muse/` 의 정적 27 레퍼런스 + 4 프로젝트 + 4 분석. 디폴트는 **empty** (실습 시작 상태). Storybook 데모용 시드는 `<MuseStoreProvider seed="fixtures">` 로 명시.
- **End-to-end 로컬 테스트 가능**: 빈 상태에서 직접 이미지 업로드 → T1 자동 태깅 → 프로젝트 위자드 → T2 추천 / T3 분석까지 백엔드 없이 (`VITE_ANTHROPIC_API_KEY` 만 있으면) 검증 가능.

### ❌ 제외된 것 (학습자가 추가)

- **Supabase 연동**: 클라이언트 / DB 매퍼 / Storage 업로드 / Edge Function 프록시 모두 없음.
- **인증 / 회원가입 / 로그인 / 어드민 / AuthGuard**: 전부 없음. 모든 라우트가 공개.
- **사용량 한도 (베타 limits)**: 없음. 무한대로 추가 가능.
- **랜딩페이지**: 제거됨. `/` 진입 시 즉시 `/archive` 로 리다이렉트.
- **Supabase 의존 CLI 테스트 스크립트**: 제거됨.

## 환경 변수

- `.env.local` 에 다음 키 필요:
  - `VITE_ANTHROPIC_API_KEY` (T1/T2/T3 호출용)

## 시작하기

```bash
pnpm install
cp .env.example .env.local   # 그리고 VITE_ANTHROPIC_API_KEY 채우기
pnpm dev
```
