/**
 * museStore <-> Supabase row mapper.
 *
 * 컴포넌트 / 페이지는 camelCase shape 유지. DB 는 snake_case.
 * 본 파일이 단일 변환 지점.
 *
 * 갱신 정책: 컬럼 추가/변경 시 본 파일 + appendix-db-schema.md + types/database.js 동시 갱신.
 */

/* ============================================
 * user_settings
 * ============================================ */

/** @returns {import('../types/database.js').UserSettingsRow|null} */
export function settingsToRow(state) {
  if (!state) return null;
  return {
    ai_model: state.aiModel,
    storage_mode: state.storageMode,
    theme_mode: state.themeMode,
    is_auto_tag_enabled: state.isAutoTagEnabled,
  };
}

export function settingsFromRow(row) {
  if (!row) return null;
  return {
    aiModel: row.ai_model,
    storageMode: row.storage_mode,
    themeMode: row.theme_mode,
    isAutoTagEnabled: row.is_auto_tag_enabled,
  };
}

/* ============================================
 * reference_items (4c-A 에서 사용)
 * ============================================ */

export function referenceFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    source: row.source,
    thumbnailUrl: row.thumbnail_url,
    title: row.title || '',
    tags: row.tags || {},
    dominantColors: row.dominant_colors || [],
    extracted: row.extracted || {},
    createdAt: row.created_at,
    storagePath: row.storage_path || null,
  };
}

export function referenceToRow(state, ownerId) {
  return {
    owner_id: ownerId,
    source: state.source,
    thumbnail_url: state.thumbnailUrl,
    title: state.title || null,
    tags: state.tags || null,
    dominant_colors: state.dominantColors || null,
    extracted: state.extracted || null,
  };
}

/* ============================================
 * projects (4c-B)
 * ============================================ */

export function projectFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    mode: row.mode,
    intent: row.intent || '',
    userNotes: row.user_notes || '',
    referenceNotes: row.reference_notes || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectToRow(state, ownerId) {
  return {
    owner_id: ownerId,
    name: state.name,
    mode: state.mode,
    intent: state.intent || null,
    user_notes: state.userNotes || null,
    reference_notes: state.referenceNotes || null,
  };
}

/* ============================================
 * analysis_results (4c-C)
 * ============================================ */

export function analysisFromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    projectId: row.project_id,
    status: row.status,
    layers: row.layers || {},
    updatedAt: row.updated_at,
  };
}

export function analysisToRow(state) {
  return {
    project_id: state.projectId,
    status: state.status,
    layers: state.layers || {},
  };
}
