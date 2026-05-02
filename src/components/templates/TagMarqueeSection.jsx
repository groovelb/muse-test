import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import MarqueeContainer from '../motion/MarqueeContainer.jsx';
import {
  getLayerTags,
  getVisualDirectionTags,
} from '../../data/muse';

/**
 * 3 row tag marquee config.
 * 1, 2, 3 row 가 각각 한 방향으로만 흐르며, 서로 방향이 교차됨 (left ↔ right ↔ left).
 * tags 는 T1 분석에서 사용하는 어휘 (muse_tags_preset).
 */
const ROWS = [
  {
    direction: 'left',
    speed: 120,
    tags: [...getLayerTags('color'), ...getLayerTags('typography')],
  },
  {
    direction: 'right',
    speed: 150,
    tags: [...getLayerTags('layout'), ...getLayerTags('gradient')],
  },
  {
    direction: 'left',
    speed: 130,
    tags: [
      ...getVisualDirectionTags('genre'),
      ...getVisualDirectionTags('style'),
      ...getVisualDirectionTags('subject'),
    ],
  },
];

/**
 * TagMarqueeSection 템플릿
 *
 * Solution1 ↔ Solution2 사이에 배치되는 3행 태그 marquee 섹션.
 * T1 어휘 (color / typography / layout / gradient / visual direction) 를 row 별로 분배해
 * 한 방향으로만 흐르는 무한 loop. 행마다 방향 교차 (left → right → left).
 * 태그 chip 사이즈는 시각 임팩트를 위해 매우 크게.
 *
 * Props:
 * @param {object} sx [Optional]
 *
 * Example usage:
 * <TagMarqueeSection />
 */
export function TagMarqueeSection({ sx }) {
  return (
    <Box
      component="section"
      sx={ {
        py: { xs: 8, md: 12 },
        overflow: 'hidden',
        backgroundColor: 'background.default',
        ...sx,
      } }
    >
      { ROWS.map((row, i) => (
        <Box key={ i } sx={ { mb: i < ROWS.length - 1 ? { xs: 1.5, md: 2.5 } : 0 } }>
          <MarqueeContainer
            direction={ row.direction }
            speed={ row.speed }
            gap={ 2 }
            isPauseOnHover={ false }
          >
            { row.tags.map((tag) => (
              <Chip
                key={ tag }
                label={ tag }
                variant="outlined"
                sx={ {
                  fontSize: { xs: 28, md: 48 },
                  height: { xs: 64, md: 104 },
                  px: { xs: 2, md: 4 },
                  fontWeight: 700,
                  letterSpacing: '-0.01em',
                  bgcolor: 'transparent',
                  color: 'text.primary',
                  borderColor: 'divider',
                  '& .MuiChip-label': {
                    px: { xs: 1, md: 2 },
                  },
                } }
              />
            )) }
          </MarqueeContainer>
        </Box>
      )) }
    </Box>
  );
}
