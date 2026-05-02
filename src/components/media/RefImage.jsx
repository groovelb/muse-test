import Box from '@mui/material/Box';

/**
 * RefImage 컴포넌트
 *
 * Reference 이미지를 렌더하는 단순 wrapper.
 * (start-point 버전: 백엔드 미연동 상태이므로 signed URL 재시도 로직 없음.
 *  Supabase Storage 연동 단계에서 만료 재서명 로직을 추가하게 됨.)
 *
 * Props:
 * @param {string} src - 이미지 URL [Optional]
 * @param {string} storagePath - (예약) 백엔드 연동 후 만료 재서명용 경로 [Optional]
 * @param {string} alt - 대체 텍스트 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <RefImage src={ ref.thumbnailUrl } alt={ ref.title } />
 */
export function RefImage({ src, storagePath: _storagePath, alt, sx, ...rest }) {
  if (!src) return null;
  return (
    <Box
      component="img"
      src={ src }
      alt={ alt }
      decoding="async"
      sx={ {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...sx,
      } }
      { ...rest }
    />
  );
}
