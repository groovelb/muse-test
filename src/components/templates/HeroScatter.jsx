import { useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

/** example/ 폴더의 이미지를 빌드 타임에 일괄 import */
const imageModules = import.meta.glob(
  '../../assets/example/*.{jpg,jpeg,JPG,JPEG}',
  { eager: true, import: 'default' },
);
const EXAMPLE_IMAGES = Object.values(imageModules);

/** 시드 기반 의사난수 (mulberry32) - 매 렌더에서 같은 좌표 보장 */
function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 깊이별 패럴럭스 강도 (px). 인덱스 = depth (0: 멀음, 2: 가까움) */
const PARALLAX_STRENGTH = [6, 14, 24];

/**
 * 중앙 세이프존 회피 + 이미지 간 겹침 방지하며 count 개 위치 생성.
 * 좌표는 % 단위, 사이즈는 px. 충돌 검사는 1400×800 기준 viewport 가정.
 *
 * @param {number} count
 * @param {number} seed
 * @returns {{x:number, y:number, size:number, depth:0|1|2}[]}
 */
function generatePositions(count, seed) {
  const rand = mulberry32(seed);
  const safe = { x: 26, y: 28, w: 48, h: 44 };
  /** 충돌 판정용 가상 viewport */
  const vw = 1400;
  const vh = 800;
  /** 이미지 사이 최소 갭 (%) - 패럴럭스 이동 마진 포함 */
  const gap = 2.2;

  const positions = [];
  let attempts = 0;
  const maxAttempts = count * 400;

  while (positions.length < count && attempts < maxAttempts) {
    attempts += 1;
    const x = rand() * 92 + 4;
    const y = rand() * 88 + 4;
    const inSafe =
      x >= safe.x && x <= safe.x + safe.w && y >= safe.y && y <= safe.y + safe.h;
    if (inSafe) continue;

    const size = 48 + Math.round(rand() * 40);
    const halfWPct = (size / vw) * 100 / 2;
    const halfHPct = (size / vh) * 100 / 2;

    const collides = positions.some((q) => {
      const qHalfWPct = (q.size / vw) * 100 / 2;
      const qHalfHPct = (q.size / vh) * 100 / 2;
      const minDx = halfWPct + qHalfWPct + gap;
      const minDy = halfHPct + qHalfHPct + gap;
      return Math.abs(x - q.x) < minDx && Math.abs(y - q.y) < minDy;
    });
    if (collides) continue;

    const depth = Math.floor(rand() * 3);
    positions.push({ x, y, size, depth });
  }
  return positions;
}

/**
 * HeroScatter 템플릿
 *
 * 배경에 example 이미지를 ScatterLayout(자유 배치)으로 흩뿌리고,
 * 중앙에 브랜드 + 태그라인 + CTA 2개를 정렬합니다.
 * 이미지 hover 시 해당 이미지가 배경 전체에 blur 로 깔리고,
 * 마우스 위치에 따라 각 이미지가 depth 비례로 시차 이동(공간감)합니다.
 *
 * Props:
 * @param {string} brandName - 워드마크 텍스트 [Optional, 기본값: 'MUSE']
 * @param {string} tagline - 메인 카피 [Optional, 기본값: '바이브 디자인을 위한 영감을 관리하세요']
 * @param {function} onPrimaryCta - "시작하기" 클릭 [Optional]
 * @param {string[]} images - 사용할 이미지 URL 배열 [Optional, 기본값: example 폴더 전체]
 * @param {number} seed - 좌표 시드 [Optional, 기본값: 7]
 *
 * Example usage:
 * <HeroScatter onPrimaryCta={ openSignup } />
 */
export function HeroScatter({
  brandName = 'MUSE',
  tagline = '바이브 디자인을 위한 영감을 관리하세요',
  onPrimaryCta,
  images = EXAMPLE_IMAGES,
  seed = 7,
}) {
  const [hoveredId, setHoveredId] = useState(null);
  const containerRef = useRef(null);
  const rafRef = useRef(0);

  const positions = useMemo(
    () => generatePositions(images.length, seed),
    [images.length, seed],
  );

  const anyHovered = hoveredId !== null;
  const hoveredSrc = anyHovered ? images[hoveredId] : null;
  const depthOpacity = [0.12, 0.18, 0.25];
  const depthScale = [0.9, 0.98, 1.06];

  /** 마우스 위치 → CSS 변수 (--mx, --my: -1 ~ 1) 로 컨테이너에 반영. rAF 로 throttle. */
  const handleMouseMove = (e) => {
    const el = containerRef.current;
    if (!el) return;
    const cx = e.clientX;
    const cy = e.clientY;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      const rect = el.getBoundingClientRect();
      const mx = ((cx - rect.left) / rect.width - 0.5) * 2;
      const my = ((cy - rect.top) / rect.height - 0.5) * 2;
      el.style.setProperty('--mx', String(mx.toFixed(3)));
      el.style.setProperty('--my', String(my.toFixed(3)));
    });
  };

  const handleMouseLeave = () => {
    const el = containerRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0');
    el.style.setProperty('--my', '0');
    setHoveredId(null);
  };

  return (
    <Box
      ref={ containerRef }
      onMouseMove={ handleMouseMove }
      onMouseLeave={ handleMouseLeave }
      sx={ {
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: 'background.default',
        '--mx': 0,
        '--my': 0,
      } }
    >
      {/* Hover backdrop: hover 시 해당 이미지가 배경 전체에 blur 로 깔림 */}
      <Box
        aria-hidden
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: hoveredSrc ? `url(${ hoveredSrc })` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(40px) saturate(1.1)',
          transform: 'scale(1.18)',
          opacity: anyHovered ? 0.65 : 0,
          transition: 'opacity 360ms ease',
          pointerEvents: 'none',
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'opacity 200ms linear',
          },
        } }
      />
      {/* Backdrop overlay: 컨텐츠 가독성 보강 */}
      <Box
        aria-hidden
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundColor: 'background.default',
          opacity: anyHovered ? 0.35 : 0,
          transition: 'opacity 360ms ease',
          pointerEvents: 'none',
        } }
      />

      {/* Scatter foreground */}
      <Box
        aria-hidden
        sx={ { position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' } }
      >
        { images.map((src, i) => {
          const p = positions[i];
          if (!p) return null;
          const isHovered = hoveredId === i;
          const opacity = isHovered ? 1 : depthOpacity[p.depth];
          const scale = isHovered ? 1.12 : depthScale[p.depth];
          const strength = PARALLAX_STRENGTH[p.depth];

          return (
            <Box
              key={ i }
              component="img"
              src={ src }
              alt=""
              loading="lazy"
              onMouseEnter={ () => setHoveredId(i) }
              onMouseLeave={ () => setHoveredId((cur) => (cur === i ? null : cur)) }
              sx={ {
                position: 'absolute',
                left: `${ p.x }%`,
                top: `${ p.y }%`,
                width: { xs: p.size * 0.7, md: p.size },
                height: { xs: p.size * 0.7, md: p.size },
                objectFit: 'cover',
                borderRadius: 1,
                boxShadow: isHovered ? 6 : 1,
                cursor: 'pointer',
                pointerEvents: 'auto',
                /** translate 이동: -50% 정렬 + 마우스 패럴럭스 (depth 비례) + scale */
                transform: `translate(calc(-50% + var(--mx, 0) * ${ strength }px), calc(-50% + var(--my, 0) * ${ strength }px)) scale(${ scale })`,
                transformOrigin: 'center',
                opacity,
                zIndex: isHovered ? 3 : 1,
                transition:
                  'opacity 320ms ease, transform 220ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 320ms ease',
                willChange: 'opacity, transform',
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'opacity 180ms linear',
                  transform: 'translate(-50%, -50%)',
                },
              } }
            />
          );
        }) }
      </Box>

      {/* Center content */}
      <Box
        sx={ {
          position: 'relative',
          zIndex: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          pointerEvents: 'none',
        } }
      >
        <Typography
          variant="h1"
          component="h1"
          sx={ {
            fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1,
            mb: 3,
            color: 'text.primary',
            fontSize: {
              xs: 'clamp(48px, 12vw, 72px)',
              md: 'clamp(72px, 9vw, 120px)',
            },
          } }
        >
          { brandName }
        </Typography>
        <Typography
          variant="h3"
          sx={ {
            fontWeight: 600,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
            mb: 5,
            maxWidth: 720,
            fontSize: {
              xs: 'clamp(20px, 5.5vw, 26px)',
              md: 'clamp(28px, 3.2vw, 40px)',
            },
            color: 'text.primary',
          } }
        >
          { tagline }
        </Typography>
        <Box sx={ { pointerEvents: 'auto' } }>
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
    </Box>
  );
}
