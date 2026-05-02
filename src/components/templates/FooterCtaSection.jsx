import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MarqueeContainer from '../motion/MarqueeContainer.jsx';

/** example/ 폴더 19장을 배경 marquee 소스로 사용 */
const imageModules = import.meta.glob(
  '../../assets/example/*.{jpg,jpeg,JPG,JPEG}',
  { eager: true, import: 'default' },
);
const EXAMPLE_IMAGES = Object.values(imageModules);

/** 3행 marquee config (Hero scatter 감성을 footer 에서 한 번 더 응용) */
const ROWS = [
  { direction: 'left', speed: 140, slice: [0, 7] },
  { direction: 'right', speed: 170, slice: [7, 13] },
  { direction: 'left', speed: 150, slice: [13, 19] },
];

/**
 * FooterCtaSection 템플릿
 *
 * 랜딩 마지막 CTA 섹션. 배경에 레퍼런스 이미지 3행 marquee (좌↔우 교차) 를 깔고
 * 그 위에 가운데 정렬 카피 + CTA 버튼.
 *
 * Props:
 * @param {function} onPrimaryCta - "시작하기" 클릭 [Optional]
 * @param {string[]} images [Optional, 기본값: example 폴더 전체]
 *
 * Example usage:
 * <FooterCtaSection onPrimaryCta={ openSignup } />
 */
export function FooterCtaSection({ onPrimaryCta, images = EXAMPLE_IMAGES }) {
  return (
    <Box
      component="section"
      sx={ {
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'background.default',
        py: { xs: 12, md: 18 },
      } }
    >
      {/* 배경 레퍼런스 marquee (3행 교차) */}
      <Box
        aria-hidden
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: { xs: 2, md: 3 },
          opacity: 0.35,
          pointerEvents: 'none',
        } }
      >
        { ROWS.map((row, i) => (
          <MarqueeContainer
            key={ i }
            direction={ row.direction }
            speed={ row.speed }
            gap={ 3 }
            isPauseOnHover={ false }
          >
            { images.slice(row.slice[0], row.slice[1]).map((src, j) => (
              <Box
                key={ j }
                component="img"
                src={ src }
                alt=""
                loading="lazy"
                sx={ {
                  width: { xs: 96, md: 140 },
                  height: { xs: 96, md: 140 },
                  objectFit: 'cover',
                  borderRadius: 1,
                  boxShadow: 1,
                } }
              />
            )) }
          </MarqueeContainer>
        )) }
      </Box>

      {/* 가독성 보강 radial overlay */}
      <Box
        aria-hidden
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: (theme) =>
            `radial-gradient(ellipse at center, ${ theme.palette.background.default } 35%, transparent 80%)`,
          pointerEvents: 'none',
        } }
      />

      {/* CTA 콘텐츠 */}
      <Box
        sx={ {
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          px: 3,
          maxWidth: 760,
          mx: 'auto',
        } }
      >
        <Typography
          variant="h3"
          sx={ {
            fontWeight: 600,
            letterSpacing: '-0.02em',
            mb: 3,
            lineHeight: 1.3,
            fontSize: {
              xs: 'clamp(28px, 6vw, 36px)',
              md: 'clamp(36px, 4vw, 56px)',
            },
          } }
        >
          오늘 본 레퍼런스, 그대로 흘려보내지 마세요.
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={ {
            mb: 4,
            maxWidth: 560,
            lineHeight: 1.7,
          } }
        >
          이메일 하나면 충분합니다. 첫 프로젝트의 결정 로그까지 30 초 안에 받아보실 수 있어요.
        </Typography>
        <Button
          onClick={ onPrimaryCta }
          variant="contained"
          color="primary"
          size="large"
          sx={ { px: 5, minWidth: 180 } }
        >
          시작하기
        </Button>
      </Box>
    </Box>
  );
}
