import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * VisualDirectionPreview
 *
 * T3 분석 결과의 visualDirection 레이어 프리뷰. 카테고리별 태그 칩 + markdown 본문.
 *
 * Props:
 * @param {object} visualDirection - { markdown, tags: { genre, style, subject } } [Required]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <VisualDirectionPreview visualDirection={ analysis.visualDirection } />
 */
export function VisualDirectionPreview({ visualDirection, sx }) {
  const vd = visualDirection || { markdown: '', tags: { genre: [], style: [], subject: [] } };

  return (
    <Box sx={ { bgcolor: 'background.paper', borderRadius: 3, p: 4, ...sx } }>
      { vd.tags && (
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 1, mb: 3 } }>
          { Object.entries(vd.tags).map(([category, list]) => (
            list?.length > 0 && (
              <Box key={ category } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={ { minWidth: 64, textTransform: 'uppercase', letterSpacing: '0.08em' } }
                >
                  { category }
                </Typography>
                <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap' } }>
                  { list.map((t) => (
                    <Box
                      key={ t }
                      sx={ {
                        px: 1,
                        py: 0.25,
                        borderRadius: 999,
                        border: '1px solid',
                        borderColor: 'divider',
                        fontSize: 12,
                      } }
                    >
                      { t }
                    </Box>
                  )) }
                </Box>
              </Box>
            )
          )) }
        </Box>
      ) }
      <Box
        component="pre"
        sx={ {
          m: 0,
          p: 2.5,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          fontSize: 13,
          lineHeight: 1.7,
          fontFamily: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '60vh',
          overflow: 'auto',
        } }
      >
        { vd.markdown || '# Visual Direction\n\n(아직 생성되지 않았습니다)' }
      </Box>
    </Box>
  );
}
