/**
 * Supabase 에러 코드/메시지 → 한국어 매핑.
 * 키: PostgREST error code | Supabase Auth error code | 영문 message
 *
 * 신규 에러 발견 시 본 파일 추가. 사용자 행동 가능한 문장으로.
 */
export const ERROR_MESSAGES = {
  // ========== Auth ==========
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다',
  'Email not confirmed': '이메일 인증이 필요합니다. 메일함을 확인해주세요',
  'User already registered': '이미 등록된 이메일입니다',
  'Email rate limit exceeded': '너무 많은 요청입니다. 잠시 후 다시 시도해주세요',
  'Password should be at least 6 characters': '비밀번호는 최소 6자 이상이어야 합니다',
  'Password should be at least 8 characters': '비밀번호는 최소 8자 이상이어야 합니다',
  'Unable to validate email address: invalid format': '올바른 이메일 형식이 아닙니다',
  'Signup requires a valid password': '비밀번호를 입력해주세요',
  'For security purposes, you can only request this after': '보안을 위해 잠시 후 다시 시도해주세요',
  'New password should be different from the old password': '기존 비밀번호와 동일합니다',
  'Token has expired or is invalid': '인증 링크가 만료되었습니다',
  'User not found': '존재하지 않는 사용자입니다',

  // ========== PostgREST (DB) ==========
  '23505': '이미 존재하는 값입니다',
  '23503': '참조된 데이터를 찾을 수 없습니다',
  '23502': '필수 입력 항목이 비어있습니다',
  '23514': '입력값이 조건을 만족하지 않습니다',
  '22P02': '잘못된 형식입니다',
  '42501': '접근 권한이 없습니다',
  PGRST116: '요청한 데이터를 찾을 수 없습니다',
  PGRST301: '세션이 만료되었습니다',

  // ========== Network ==========
  'Failed to fetch': '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요',
  'TypeError: Network request failed': '네트워크 오류가 발생했습니다',

  // ========== Storage ==========
  'The resource was not found': '파일을 찾을 수 없습니다',
  'Payload too large': '파일 크기가 너무 큽니다',
  'Mime type not supported': '지원하지 않는 파일 형식입니다',
};
