/**
 * MUSE AI 클라이언트 헬퍼 (Phase 6 Stage B 버전)
 *
 * Anthropic 호출을 Supabase Edge Function (`anthropic-proxy`) 로 우회.
 * 키는 서버 secret (ANTHROPIC_API_KEY) 으로만 보관. 브라우저 번들에 노출되지 않음.
 *
 * 프록시 응답 포맷: { ok: true, data } | { ok: false, error: { code, message, status? } }
 *
 * 호출 시 supabase-js 가 현재 사용자 JWT 를 Authorization 헤더에 자동 첨부.
 * Edge Function 이 JWT 를 검증하므로 비로그인 호출은 401.
 */

import { supabase } from '../lib/supabase.js';

const FUNCTION_NAME = 'anthropic-proxy';

/** 헬스 체크 — Supabase 클라이언트 존재 여부만 확인 (실제 호출 X) */
export async function checkAnthropicHealth() {
  return {
    ok: true,
    hasKey: true, // 서버 보유. 클라이언트에서는 확인 불가
    endpoint: `supabase.functions.invoke('${FUNCTION_NAME}')`,
  };
}

/**
 * Anthropic messages.create 호출 (Edge Function 경유).
 *
 * @param {object} params
 * @param {string} params.model - 예: 'claude-haiku-4-5-20251001'
 * @param {string} [params.system] - 시스템 프롬프트
 * @param {Array}  params.messages - [{ role: 'user'|'assistant', content: ... }]
 * @param {Array}  [params.tools]
 * @param {object} [params.tool_choice]
 * @param {number} [params.max_tokens]
 * @param {number} [params.temperature]
 * @returns {Promise<object>} Anthropic API 응답 원본 (proxy 응답의 .data)
 */
export async function callAnthropic(params) {
  const { data: invokeData, error: invokeErr } = await supabase.functions.invoke(
    FUNCTION_NAME,
    { body: params },
  );

  if (invokeErr) {
    // Edge Runtime / 네트워크 / FunctionsHttpError
    const err = new Error(
      `Edge function error: ${invokeErr.message || 'unknown'}`,
    );
    err.status = invokeErr.status || invokeErr.context?.status || null;
    err.detail = invokeErr;
    throw err;
  }

  if (!invokeData || invokeData.ok !== true) {
    const code = invokeData?.error?.code || 'unknown';
    const message = invokeData?.error?.message || 'Edge function returned non-ok';
    const status = invokeData?.error?.status || null;
    const err = new Error(`Anthropic proxy error [${code}]: ${message}`);
    err.status = status;
    err.detail = invokeData?.error || invokeData;
    throw err;
  }

  return invokeData.data;
}

/**
 * 응답 content blocks에서 첫 tool_use 블록의 input 객체 추출.
 * @param {object} response - Anthropic messages 응답
 * @param {string} [toolName] - 특정 tool 이름으로 필터링
 * @returns {object|null}
 */
export function extractToolInput(response, toolName) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return null;
  const block = blocks.find(
    (b) => b.type === 'tool_use' && (!toolName || b.name === toolName),
  );
  return block?.input || null;
}

/**
 * 응답에서 text 블록을 합쳐 평문으로 반환 (폴백/디버그용)
 */
export function extractText(response) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return '';
  return blocks.filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

/**
 * 동일 tool 이 여러 번 호출됐을 때 input 들을 머지.
 *  - 배열 필드: concat (중복 토큰은 id 기준 dedupe)
 *  - 객체 필드: shallow merge (later wins)
 *  - 스칼라: later wins (모델이 후속 호출에서 refine 한다고 가정)
 *
 * Haiku 4.5 가 tool_choice='any' 에서 submit_tokens 를
 * 레이어별로 분할 호출하는 경우(예: color → typography → layout → gradient
 * 각각 1번씩) 마지막 input 만 살아남으면 다른 레이어가 빈 배열로 사라진다.
 * 이를 방지하기 위해 merge.
 */
function mergeToolInputs(prev, next) {
  if (!prev) return next;
  if (!next) return prev;
  const out = { ...prev };
  for (const [k, v] of Object.entries(next)) {
    if (Array.isArray(v) && Array.isArray(prev[k])) {
      const seen = new Set(prev[k].map((it) => it?.id).filter(Boolean));
      const merged = [...prev[k]];
      for (const item of v) {
        if (item && typeof item === 'object' && item.id) {
          if (!seen.has(item.id)) {
            merged.push(item);
            seen.add(item.id);
          }
        } else {
          merged.push(item);
        }
      }
      out[k] = merged;
    } else if (v && typeof v === 'object' && !Array.isArray(v) && prev[k] && typeof prev[k] === 'object') {
      out[k] = { ...prev[k], ...v };
    } else if (v !== undefined && v !== null && v !== '') {
      out[k] = v;
    }
  }
  return out;
}

/**
 * 모든 tool_use 블록의 input을 이름별 map으로 추출.
 * 동일 tool 이름 중복 호출 시 input merge (덮어쓰기 X).
 * @param {object} response
 * @returns {Record<string, object>} { [toolName]: mergedInput }
 */
export function extractAllToolInputs(response) {
  const blocks = response?.content;
  if (!Array.isArray(blocks)) return {};
  const result = {};
  for (const b of blocks) {
    if (b.type === 'tool_use' && b.name) {
      result[b.name] = mergeToolInputs(result[b.name], b.input);
    }
  }
  return result;
}

/**
 * 이미지 URL(dataURL 또는 http)을 Anthropic messages content의 image block으로 변환.
 * - data URL이면 base64 + media_type 추출
 * - http URL이면 { type: 'image', source: { type: 'url', url } } 사용 (2025+ 지원)
 */
export function toImageBlock(src) {
  if (!src) return null;
  if (src.startsWith('data:')) {
    const match = src.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) return null;
    return {
      type: 'image',
      source: { type: 'base64', media_type: match[1], data: match[2] },
    };
  }
  return { type: 'image', source: { type: 'url', url: src } };
}

/**
 * Vite import된 이미지 URL을 base64 data URL로 fetch & 변환.
 * Storybook iframe 내부에서 fetch → Blob → FileReader.
 */
export async function imageUrlToBase64DataUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${url}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * File 객체 → base64 data URL 변환 (업로드 flow 전용)
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Canvas 리사이즈 — 긴 변을 maxDim 이하로 (AI payload 절감).
 * @param {string} dataUrl - data:image/...;base64,...
 * @param {number} maxDim - 기본 1024
 * @returns {Promise<string>} 리사이즈된 JPEG data URL (품질 0.85)
 */
export function resizeDataUrl(dataUrl, maxDim = 1024) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}
