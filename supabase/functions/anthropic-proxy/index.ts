/**
 * Anthropic API proxy.
 *
 * 클라이언트의 callAnthropic 호출을 받아 서버에서 Anthropic Messages API 로 passthrough.
 * - JWT 검증: 로그인 사용자만 호출 가능 (auth.getUser)
 * - 키 격리: ANTHROPIC_API_KEY 는 supabase secrets 에만. 클라이언트 번들에 노출 0
 * - body 그대로 전달: model / system / messages / tools / tool_choice / max_tokens 등
 *
 * 클라이언트 호출:
 *   const { data, error } = await supabase.functions.invoke('anthropic-proxy', { body: params });
 *   // supabase-js 가 현재 사용자 JWT 를 자동으로 Authorization 헤더에 첨부
 *
 * 응답 구조:
 *   { ok: true, data: <Anthropic 원본 응답> }   (성공)
 *   { ok: false, error: { code, message } }     (실패)
 */

import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 운영 도메인 좁히기 시 변경
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ ok: false, error: { code: 'method_not_allowed', message: 'POST only' } }, 405);
  }

  try {
    // 1. JWT 검증 (로그인 사용자만 통과)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ ok: false, error: { code: 'unauthorized', message: '로그인이 필요합니다' } }, 401);
    }
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ ok: false, error: { code: 'unauthorized', message: '세션이 유효하지 않습니다' } }, 401);
    }

    // 2. 입력 검증 (간단)
    const params = await req.json();
    if (!params || typeof params !== 'object') {
      return json({ ok: false, error: { code: 'invalid_input', message: '요청 본문이 비어있습니다' } }, 400);
    }
    if (!params.model || !Array.isArray(params.messages)) {
      return json({ ok: false, error: { code: 'invalid_input', message: 'model 과 messages 가 필요합니다' } }, 400);
    }

    // 3. secret 확인
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY missing in secrets');
      return json({ ok: false, error: { code: 'server_misconfigured', message: '서버 설정 오류' } }, 500);
    }

    // 4. Anthropic 호출 (원본 그대로 passthrough)
    const upstream = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const upstreamBody = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      const upstreamMsg =
        upstreamBody?.error?.message ||
        upstreamBody?.error ||
        upstreamBody?.message ||
        'unknown';
      console.error('anthropic_upstream_error', upstream.status, upstreamMsg);
      return json(
        {
          ok: false,
          error: {
            code: 'upstream_error',
            message: `Anthropic ${upstream.status}: ${upstreamMsg}`,
            status: upstream.status,
          },
        },
        502,
      );
    }

    return json({ ok: true, data: upstreamBody });
  } catch (e) {
    console.error('anthropic_proxy_internal_error', e);
    return json(
      { ok: false, error: { code: 'internal_error', message: '서버 내부 오류' } },
      500,
    );
  }
});
