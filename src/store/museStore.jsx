/**
 * MUSE Store — Context + useReducer (in-memory only, start-point 버전)
 *
 * 이 시작 키트에는 백엔드 연동이 없다. 모든 CRUD 는 메모리 내 dispatch 만 수행한다.
 * 페이지 새로고침 시 상태가 초기화된다 (의도된 동작).
 *
 * 디폴트 시드: empty (실습은 빈 상태에서 직접 업로드 → T1 → 프로젝트 생성 → T2/T3 까지 검증).
 * Storybook 등 데모용 fixtures 가 필요하면 <MuseStoreProvider seed="fixtures"> 로 전환.
 *
 * 학습 단계에서 Supabase 연동을 추가할 때 다음을 확장한다:
 *   - addReference: Supabase Storage 업로드 + reference_items insert
 *   - addProject:   projects insert + project_references insert
 *   - setAnalysis:  analysis_results upsert
 *   - updateSettings: user_settings update
 *   - hydrate effect: 로그인 사용자의 데이터 fetch
 */

import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  references as fixtureReferences,
  projects as fixtureProjects,
  analysisResultsByProjectId as fixtureAnalyses,
  defaultUserSettings,
} from '../data/muse';
import { supabase } from '../lib/supabase.js';
import {
  settingsFromRow,
  settingsToRow,
  referenceFromRow,
  projectFromRow,
} from './supabaseMappers.js';

const REFERENCES_BUCKET = 'references';

const MuseContext = createContext(null);

const FIXTURES_STATE = {
  references: fixtureReferences,
  projects: fixtureProjects,
  analyses: fixtureAnalyses,
  settings: { ...defaultUserSettings },
  loading: false,
  hydrated: true,
};

const EMPTY_STATE = {
  references: [],
  projects: [],
  analyses: {},
  settings: { ...defaultUserSettings },
  loading: false,
  hydrated: true,
};

/* ============================================
 * Reducer
 * ============================================ */

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_REFERENCE':
      return { ...state, references: [action.payload, ...state.references] };

    case 'UPDATE_REFERENCE': {
      const { id, patch } = action.payload;
      return {
        ...state,
        references: state.references.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      };
    }

    case 'REMOVE_REFERENCE':
      return { ...state, references: state.references.filter((r) => r.id !== action.payload) };

    case 'SET_REFERENCES':
      return { ...state, references: action.payload };

    case 'ADD_PROJECT':
      return { ...state, projects: [action.payload, ...state.projects] };

    case 'UPDATE_PROJECT': {
      const { id, patch } = action.payload;
      return {
        ...state,
        projects: state.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
    }

    case 'REMOVE_PROJECT': {
      const id = action.payload;
      const { [id]: _removed, ...remainingAnalyses } = state.analyses;
      return {
        ...state,
        projects: state.projects.filter((p) => p.id !== id),
        analyses: remainingAnalyses,
      };
    }

    case 'SET_PROJECTS':
      return { ...state, projects: action.payload };

    case 'SET_ANALYSIS':
      return {
        ...state,
        analyses: { ...state.analyses, [action.payload.projectId]: action.payload },
      };

    case 'UPDATE_ANALYSIS_LAYER': {
      const { projectId, layerKey, tokenId, patch } = action.payload;
      const current = state.analyses[projectId];
      if (!current) return state;

      const layer = current.layers[layerKey];
      let nextLayer;
      if (Array.isArray(layer)) {
        nextLayer = layer
          .map((t) => (t.id === tokenId ? { ...t, ...patch } : t))
          .filter((t) => !t._removed);
      } else {
        nextLayer = { ...layer, ...patch };
      }
      return {
        ...state,
        analyses: {
          ...state.analyses,
          [projectId]: {
            ...current,
            layers: { ...current.layers, [layerKey]: nextLayer },
          },
        },
      };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'SET_SETTINGS':
      return { ...state, settings: { ...defaultUserSettings, ...action.payload } };

    case 'RESET_SETTINGS':
      return { ...state, settings: { ...defaultUserSettings } };

    default:
      return state;
  }
}

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID
  ? crypto.randomUUID()
  : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);

/* ============================================
 * Provider
 * ============================================ */

/**
 * @param {object} props
 * @param {'empty'|'fixtures'} [props.seed='empty'] - empty: 빈 상태 (실습 디폴트) / fixtures: 데모 데이터 시드 (Storybook 용, supabase 호출 안 함)
 */
export function MuseStoreProvider({ children, seed = 'empty' }) {
  const initial = seed === 'fixtures' ? FIXTURES_STATE : EMPTY_STATE;
  const [state, dispatch] = useReducer(reducer, initial);

  // seed='fixtures' 는 Storybook 데모 모드 → supabase 호출 차단
  useSupabaseHydration(dispatch, seed);

  return (
    <MuseContext.Provider value={ { state, dispatch, seed } }>
      { children }
    </MuseContext.Provider>
  );
}

/**
 * supabase auth 변경에 반응해 사용자 데이터를 store 에 hydrate.
 * 4c-D: user_settings. 4c-A: references. 4c-B/C 에서 projects/analyses 추가.
 *
 * @param {Function} dispatch
 * @param {'empty'|'fixtures'} seed
 */
function useSupabaseHydration(dispatch, seed) {
  useEffect(() => {
    if (seed === 'fixtures') return undefined;

    let mounted = true;

    const loadForUser = async (userId) => {
      if (!userId) {
        dispatch({ type: 'RESET_SETTINGS' });
        dispatch({ type: 'SET_REFERENCES', payload: [] });
        dispatch({ type: 'SET_PROJECTS', payload: [] });
        return;
      }

      // settings (RLS: id = auth.uid())
      const { data: settingsRow, error: settingsErr } = await supabase
        .from('user_settings')
        .select('*')
        .eq('id', userId)
        .single();
      if (!mounted) return;
      if (settingsErr) {
        dispatch({ type: 'RESET_SETTINGS' });
      } else {
        const settings = settingsFromRow(settingsRow);
        if (settings) dispatch({ type: 'SET_SETTINGS', payload: settings });
      }

      // references (RLS: owner_id = auth.uid() — 명시 필터 불필요하지만 안전)
      const { data: refRows, error: refErr } = await supabase
        .from('reference_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (refErr) {
        console.error('[hydration] references load failed', refErr);
        dispatch({ type: 'SET_REFERENCES', payload: [] });
      } else {
        dispatch({
          type: 'SET_REFERENCES',
          payload: (refRows || []).map(referenceFromRow),
        });
      }

      // projects + 임베드 project_references (M:N 매핑)
      const { data: projectRows, error: projectErr } = await supabase
        .from('projects')
        .select('*, project_references(reference_id, use_layers)')
        .order('created_at', { ascending: false });
      if (!mounted) return;
      if (projectErr) {
        console.error('[hydration] projects load failed', projectErr);
        dispatch({ type: 'SET_PROJECTS', payload: [] });
      } else {
        dispatch({
          type: 'SET_PROJECTS',
          payload: (projectRows || []).map((row) => ({
            ...projectFromRow(row),
            referenceIds: (row.project_references || []).map((pr) => pr.reference_id),
            selectedRefs: (row.project_references || []).map((pr) => ({
              id: pr.reference_id,
              useLayers: pr.use_layers || [],
            })),
          })),
        });
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      loadForUser(data.session?.user?.id);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadForUser(session?.user?.id);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [dispatch, seed]);
}

/* ============================================
 * Hooks
 * ============================================ */

function useCtx() {
  const ctx = useContext(MuseContext);
  if (!ctx) throw new Error('useMuseStore must be used inside <MuseStoreProvider>');
  return ctx;
}

export function useReferencesSlice() {
  const { state, dispatch, seed } = useCtx();

  const addReference = async (payload = {}) => {
    const { file, ...fields } = payload;

    // Storybook fixtures 모드: 메모리만 (기존 동작)
    if (seed === 'fixtures') {
      const id = fields.id || genId();
      const reference = {
        ...fields,
        id,
        source: fields.source || (file ? 'file' : 'url'),
        storagePath: fields.storagePath || null,
        thumbnailUrl: fields.thumbnailUrl || null,
        title: fields.title || '',
        tags: fields.tags || {},
        dominantColors: fields.dominantColors || [],
        extracted: fields.extracted || {},
        createdAt: fields.createdAt || new Date().toISOString(),
      };
      dispatch({ type: 'ADD_REFERENCE', payload: reference });
      return reference;
    }

    // 실 모드: Supabase Storage + DB insert
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error('로그인이 필요합니다');

    let storagePath = null;
    let thumbnailUrl = fields.thumbnailUrl || null;

    // file 소스: Storage 업로드 → public URL
    if (file) {
      const ext = (file.name?.split('.').pop() || 'png').toLowerCase();
      storagePath = `${userId}/${genId()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from(REFERENCES_BUCKET)
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage
        .from(REFERENCES_BUCKET)
        .getPublicUrl(storagePath);
      thumbnailUrl = urlData.publicUrl;
    }

    // DB insert
    const dbRow = {
      owner_id: userId,
      source: fields.source || (file ? 'file' : 'url'),
      thumbnail_url: thumbnailUrl,
      title: fields.title || null,
      tags: fields.tags || null,
      dominant_colors: fields.dominantColors || null,
      extracted: fields.extracted || null,
      storage_path: storagePath,
    };
    const { data: inserted, error: insertErr } = await supabase
      .from('reference_items')
      .insert(dbRow)
      .select()
      .single();

    if (insertErr) {
      // rollback Storage upload (best effort)
      if (storagePath) {
        await supabase.storage.from(REFERENCES_BUCKET).remove([storagePath]);
      }
      throw insertErr;
    }

    // transient UI 플래그 (_pending) 는 DB 미저장, dispatch 시점에만 보존
    const reference = {
      ...referenceFromRow(inserted),
      _pending: fields._pending || false,
    };
    dispatch({ type: 'ADD_REFERENCE', payload: reference });
    return reference;
  };

  const updateReference = async (id, patch) => {
    // 낙관적 UI 갱신 (transient _pending / _tagError 포함)
    dispatch({ type: 'UPDATE_REFERENCE', payload: { id, patch } });

    if (seed === 'fixtures') return;

    // DB 영속 컬럼만 추출 (transient 플래그는 스킵)
    const dbPatch = {};
    if ('thumbnailUrl' in patch) dbPatch.thumbnail_url = patch.thumbnailUrl;
    if ('title' in patch) dbPatch.title = patch.title;
    if ('tags' in patch) dbPatch.tags = patch.tags;
    if ('dominantColors' in patch) dbPatch.dominant_colors = patch.dominantColors;
    if ('extracted' in patch) dbPatch.extracted = patch.extracted;
    if (Object.keys(dbPatch).length === 0) return;

    const { error } = await supabase
      .from('reference_items')
      .update(dbPatch)
      .eq('id', id);
    if (error) console.error('[useReferencesSlice] update failed', error);
  };

  const removeReference = async (id) => {
    // 삭제 전 storage_path 캡처 (dispatch 후엔 사라짐)
    const target = state.references.find((r) => r.id === id);
    dispatch({ type: 'REMOVE_REFERENCE', payload: id });

    if (seed === 'fixtures') return;

    const { error } = await supabase
      .from('reference_items')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('[useReferencesSlice] delete failed', error);
      return;
    }
    if (target?.storagePath) {
      const { error: storageErr } = await supabase.storage
        .from(REFERENCES_BUCKET)
        .remove([target.storagePath]);
      if (storageErr) console.error('[useReferencesSlice] storage cleanup failed', storageErr);
    }
  };

  return {
    references: state.references,
    loading: state.loading,
    hydrated: state.hydrated,
    addReference,
    updateReference,
    removeReference,
  };
}

export function useProjectsSlice() {
  const { state, dispatch, seed } = useCtx();

  const addProject = async (project) => {
    // Storybook fixtures: 메모리 dispatch 만 (기존 동작)
    if (seed === 'fixtures') {
      const id = project.id || genId();
      const full = {
        id,
        name: project.name,
        intent: project.intent || '',
        userNotes: project.userNotes || '',
        mode: project.mode,
        referenceNotes: project.referenceNotes || {},
        selectedRefs: project.selectedRefs || [],
        referenceIds: project.referenceIds || [],
        createdAt: project.createdAt || new Date().toISOString(),
      };
      dispatch({ type: 'ADD_PROJECT', payload: full });
      return full;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) throw new Error('로그인이 필요합니다');

    // 1) projects insert
    const projectRow = {
      owner_id: userId,
      name: project.name,
      mode: project.mode,
      intent: project.intent || null,
      user_notes: project.userNotes || null,
      reference_notes: project.referenceNotes || null,
    };
    const { data: insertedProject, error: projectErr } = await supabase
      .from('projects')
      .insert(projectRow)
      .select()
      .single();
    if (projectErr) throw projectErr;

    const projectId = insertedProject.id;

    // 2) project_references batch insert (M:N 매핑)
    // selectedRefs 우선 → useLayers 보존. 없으면 referenceIds 만으로 빈 useLayers.
    const refRows = (() => {
      const fromSelected = (project.selectedRefs || []).map((sr) => ({
        project_id: projectId,
        reference_id: sr.id,
        use_layers: sr.useLayers || [],
      }));
      if (fromSelected.length > 0) return fromSelected;
      return (project.referenceIds || []).map((refId) => ({
        project_id: projectId,
        reference_id: refId,
        use_layers: [],
      }));
    })();

    if (refRows.length > 0) {
      const { error: prErr } = await supabase
        .from('project_references')
        .insert(refRows);
      if (prErr) {
        // rollback project (cascade 로 project_references 도 삭제됨)
        await supabase.from('projects').delete().eq('id', projectId);
        throw prErr;
      }
    }

    const full = {
      ...projectFromRow(insertedProject),
      referenceIds: refRows.map((r) => r.reference_id),
      selectedRefs: refRows.map((r) => ({
        id: r.reference_id,
        useLayers: r.use_layers,
      })),
    };
    dispatch({ type: 'ADD_PROJECT', payload: full });
    return full;
  };

  const updateProject = async (id, patch) => {
    // 낙관적 갱신
    dispatch({ type: 'UPDATE_PROJECT', payload: { id, patch } });

    if (seed === 'fixtures') return;

    // DB 영속 컬럼만 (referenceIds / selectedRefs 갱신은 4c-B 범위 외)
    const dbPatch = {};
    if ('name' in patch) dbPatch.name = patch.name;
    if ('mode' in patch) dbPatch.mode = patch.mode;
    if ('intent' in patch) dbPatch.intent = patch.intent;
    if ('userNotes' in patch) dbPatch.user_notes = patch.userNotes;
    if ('referenceNotes' in patch) dbPatch.reference_notes = patch.referenceNotes;
    if (Object.keys(dbPatch).length === 0) return;

    const { error } = await supabase
      .from('projects')
      .update(dbPatch)
      .eq('id', id);
    if (error) console.error('[useProjectsSlice] update failed', error);
  };

  const removeProject = async (id) => {
    dispatch({ type: 'REMOVE_PROJECT', payload: id });

    if (seed === 'fixtures') return;

    // CASCADE 가 project_references / analysis_results 까지 정리
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) console.error('[useProjectsSlice] delete failed', error);
  };

  return {
    projects: state.projects,
    loading: state.loading,
    hydrated: state.hydrated,
    addProject,
    updateProject,
    removeProject,
  };
}

export function useAnalysesSlice() {
  const { state, dispatch } = useCtx();

  const setAnalysis = async (analysis) => {
    const full = {
      id: analysis.id || genId(),
      projectId: analysis.projectId,
      layers: analysis.layers || {},
      status: analysis.status || 'done',
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'SET_ANALYSIS', payload: full });
    return full;
  };

  const updateLayer = async (projectId, layerKey, tokenId, patch) => {
    dispatch({ type: 'UPDATE_ANALYSIS_LAYER', payload: { projectId, layerKey, tokenId, patch } });
  };

  return {
    analyses: state.analyses,
    loading: state.loading,
    hydrated: state.hydrated,
    getAnalysis: (projectId) => state.analyses[projectId],
    setAnalysis,
    updateLayer,
  };
}

export function useSettingsSlice() {
  const { state, dispatch, seed } = useCtx();

  const updateSettings = async (patch) => {
    // 낙관적 업데이트: UI 즉시 반영
    dispatch({ type: 'UPDATE_SETTINGS', payload: patch });

    // Storybook 데모 모드는 supabase 호출 스킵
    if (seed === 'fixtures') return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const next = { ...state.settings, ...patch };
    const row = settingsToRow(next);
    const { error } = await supabase
      .from('user_settings')
      .update(row)
      .eq('id', userId);
    if (error) {
      console.error('[useSettingsSlice] update failed', error);
    }
  };

  return {
    settings: state.settings,
    updateSettings,
  };
}

export function useMuseStore() {
  return useCtx();
}
