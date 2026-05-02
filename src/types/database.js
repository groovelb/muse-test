/**
 * MUSE 데이터베이스 row 타입 (JSDoc typedef).
 *
 * `appendix-db-schema.md` 의 컬럼 정의와 1:1 일치.
 * Phase 4·5 에서 사용하는 데이터 훅의 반환 타입 힌트.
 *
 * 갱신 정책:
 * - 컬럼 추가/변경 시 본 파일 + appendix-db-schema.md 동시 갱신
 * - 자동 생성 가능: `supabase gen types typescript --linked` → ts-to-jsdoc 변환 (선택)
 */

/**
 * @typedef {Object} ProfileRow
 * @property {string} id - uuid (= auth.users.id)
 * @property {string|null} display_name
 * @property {string|null} avatar_url
 * @property {string} created_at - ISO timestamp
 * @property {string} updated_at - ISO timestamp
 */

/**
 * @typedef {Object} UserSettingsRow
 * @property {string} id - uuid (= auth.users.id)
 * @property {string} ai_model
 * @property {'local'|'cloud'} storage_mode
 * @property {'light'|'dark'|'system'} theme_mode
 * @property {boolean} is_auto_tag_enabled
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ReferenceItemRow
 * @property {string} id - uuid
 * @property {string} owner_id - uuid (auth.users.id)
 * @property {'file'|'url'} source
 * @property {string} thumbnail_url
 * @property {string|null} title
 * @property {Object|null} tags - 레이어별 태그 묶음 (jsonb)
 * @property {string[]|null} dominant_colors - HEX 1~5개
 * @property {Object|null} extracted - T1 자동 태깅 관찰 값
 * @property {string} created_at
 */

/**
 * @typedef {Object} ProjectRow
 * @property {string} id - uuid
 * @property {string} owner_id
 * @property {string} name
 * @property {'concept'|'system'} mode
 * @property {string|null} intent
 * @property {string|null} user_notes
 * @property {Object|null} reference_notes - { refId: text } (jsonb)
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} ProjectReferenceRow
 * @property {string} id
 * @property {string} project_id
 * @property {string} reference_id
 * @property {string[]} use_layers - color/typography/layout/gradient/visualDirection
 */

/**
 * @typedef {Object} AnalysisResultRow
 * @property {string} id
 * @property {string} project_id
 * @property {'pending'|'running'|'done'|'error'} status
 * @property {Object} layers - 5 레이어 토큰 묶음 (jsonb). 각 토큰의 label / isEnabled / emphasis / sourceReferenceIds / decisionRationale
 * @property {string} updated_at
 */

/**
 * @typedef {Object} NormalizedError
 * @property {string} message - 사용자 노출용 한국어 메시지
 * @property {string|null} code - PostgREST / Auth 에러 코드
 */

export {};
