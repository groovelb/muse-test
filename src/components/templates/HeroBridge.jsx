import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { BridgeMarquee } from './BridgeMarquee.jsx';

/** example/ 폴더의 이미지를 빌드 타임에 일괄 import */
const imageModules = import.meta.glob(
  '../../assets/example/*.{jpg,jpeg,JPG,JPEG}',
  { eager: true, import: 'default' },
);
const EXAMPLE_IMAGES = Object.values(imageModules);

const ROW_COUNT = 4;
const ROW_Y = ['12.5%', '37.5%', '62.5%', '87.5%'];
const ROW_DIRECTIONS = ['left', 'right', 'left', 'right'];
const ROW_DURATIONS = [80, 95, 75, 90];

/** 시드 기반 의사난수 (mulberry32) */
function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * scatter 출발 좌표 (% 기준 stage) + 사이즈 + depth.
 * HeroScatter 와 동일한 시드 / 충돌 검사 로직을 사용해 동일한 결과 생성.
 */
function generateScatterPositions(count, seed) {
  const rand = mulberry32(seed);
  const safe = { x: 26, y: 28, w: 48, h: 44 };
  const vw = 1400;
  const vh = 800;
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
 * HeroBridge 템플릿
 *
 * Hero (scatter + 패럴럭스 + hover backdrop + MUSE/CTA) 와 Bridge (질문 텍스트 + 4행 marquee) 가
 * sticky stage 1개를 공유. 이미지 19장은 BridgeMarquee row 의 자식으로 단일 DOM 인스턴스로
 * 존재하며, 스크롤 progress(`--p`) 에 따라 transform offset 으로 scatter ↔ marquee 자연 위치를
 * 선형 보간 → 위치 끊김 0.
 *
 * 컨테이너 height = 400vh (sticky 자식 100vh 가 300vh 동안 stuck):
 * - 0 ~ 100vh   scroll: 진행률 0 (Hero 정적, scatter, 패럴럭스, hover backdrop 활성)
 * - 100~200vh   scroll: 진행률 0→1 (이미지 offset 0으로 수렴, Hero text fade out, Bridge text fade in)
 * - 200~300vh   scroll: 진행률 1 (Bridge fullscreen 정적, marquee animation running)
 *
 * Props:
 * @param {string} brandName [Optional, 기본값: 'MUSE']
 * @param {string} tagline [Optional]
 * @param {string} bridgeLine1 [Optional]
 * @param {string} bridgeLine2 [Optional]
 * @param {function} onPrimaryCta - "시작하기" 클릭 [Optional]
 * @param {string[]} images [Optional, 기본값: example 폴더 전체]
 * @param {number} seed [Optional, 기본값: 7]
 * @param {number} gap - marquee row 내 이미지 간격 px [Optional, 기본값: 140]
 *
 * Example usage:
 * <HeroBridge onPrimaryCta={ openSignup } />
 */
export function HeroBridge({
  brandName = 'MUSE',
  tagline = '바이브 디자인을 위한 영감을 관리하세요',
  bridgeLine1 = '레퍼런스로 만든 AI 의 디자인,',
  bridgeLine2 = '얼마나 이해하고 계신가요?',
  onPrimaryCta,
  images = EXAMPLE_IMAGES,
  seed = 7,
  gap = 140,
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const scrollRafRef = useRef(0);
  const mouseRafRef = useRef(0);
  const progressRef = useRef(0);

  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scatterPositions = useMemo(
    () => generateScatterPositions(images.length, seed),
    [images.length, seed],
  );

  /** 19장 → 4행 분배 (i % 4). 각 항목에 originalIndex 보존. */
  const rowItems = useMemo(() => {
    const rows = [[], [], [], []];
    scatterPositions.forEach((p, i) => {
      rows[i % ROW_COUNT].push({ ...p, originalIndex: i });
    });
    return rows;
  }, [scatterPositions]);

  /** stage 사이즈 측정 + ResizeObserver */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    const measure = () => {
      const rect = stage.getBoundingClientRect();
      setStageSize({ w: rect.width, h: rect.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    return () => ro.disconnect();
  }, []);

  /**
   * 각 row 의 BridgeMarquee config + 1set scatter offset 계산.
   * 자연 위치 (px, stage 기준):
   *   row container left = (stageW - setWidth) / 2
   *   자식 c 의 set 안 left = sum(sizes[0..c-1]) + c * gap
   *   자식 c 의 stage 자연 left (좌상단) = rowContainerLeft + setLeft
   *   자식 c 의 stage 자연 top (좌상단) = rowY% × stageH - size/2
   *
   * scatter target (px, 좌상단 기준):
   *   left = sx% × stageW - size/2
   *   top  = sy% × stageH - size/2
   *
   * offset = scatter - 자연.
   */
  const marqueeRows = useMemo(() => {
    if (stageSize.w === 0) return [];
    return rowItems.map((items, r) => {
      const sizes = items.map((it) => it.size);
      const depths = items.map((it) => it.depth);
      const indexMap = items.map((it) => it.originalIndex);
      const setImages = items.map((it) => images[it.originalIndex]);

      const n = sizes.length;
      const setWidth = sizes.reduce((s, x) => s + x, 0) + gap * (n - 1);
      const rowLeft = Math.round((stageSize.w - setWidth) / 2);

      const naturalLefts = [];
      let acc = 0;
      for (let c = 0; c < n; c += 1) {
        naturalLefts.push(acc);
        acc += sizes[c] + gap;
      }

      const rowYPct = parseFloat(ROW_Y[r]) / 100;
      const offsets = items.map((it, c) => {
        const naturalLeft = rowLeft + naturalLefts[c];
        const naturalTop = rowYPct * stageSize.h - it.size / 2;
        const scatterLeft = (it.x / 100) * stageSize.w - it.size / 2;
        const scatterTop = (it.y / 100) * stageSize.h - it.size / 2;
        return {
          ox: Math.round(scatterLeft - naturalLeft),
          oy: Math.round(scatterTop - naturalTop),
        };
      });

      const maxSize = Math.max(...sizes);

      return {
        images: setImages,
        sizes,
        depths,
        offsets,
        indexMap,
        setWidth,
        height: maxSize,
        rowLeft,
        direction: ROW_DIRECTIONS[r],
        duration: ROW_DURATIONS[r],
        y: ROW_Y[r],
        gap,
      };
    });
  }, [rowItems, images, stageSize, gap]);

  /** 스크롤 → stage 의 --p 갱신 + isPlaying 토글 (latch + reset). */
  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return undefined;

    const update = () => {
      scrollRafRef.current = 0;
      const rect = container.getBoundingClientRect();
      const scrolled = -rect.top;
      const transStart = window.innerHeight;
      const transEnd = window.innerHeight * 2;
      const p = Math.max(
        0,
        Math.min(1, (scrolled - transStart) / (transEnd - transStart)),
      );
      stage.style.setProperty('--p', p.toFixed(4));
      progressRef.current = p;

      if (p >= 0.99) {
        setIsPlaying((prev) => (prev ? prev : true));
      } else if (p <= 0.05) {
        setIsPlaying((prev) => (prev ? false : prev));
      }
    };

    const onScroll = () => {
      if (scrollRafRef.current) return;
      scrollRafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  /** 마우스 이동 → stage 의 --mx, --my 갱신 (rAF throttle) */
  const handleMouseMove = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    if (mouseRafRef.current) return;
    const cx = e.clientX;
    const cy = e.clientY;
    mouseRafRef.current = requestAnimationFrame(() => {
      mouseRafRef.current = 0;
      const rect = stage.getBoundingClientRect();
      const mx = ((cx - rect.left) / rect.width - 0.5) * 2;
      const my = ((cy - rect.top) / rect.height - 0.5) * 2;
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
    });
  };

  const handleMouseLeave = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--mx', '0');
    stage.style.setProperty('--my', '0');
    setHoveredIdx(null);
  };

  /** 이미지 hover (1set 자식만 트리거). progress >= 0.4 일 땐 무시. */
  const handleImageEnter = (idx) => {
    if (idx == null) return;
    if (progressRef.current >= 0.4) return;
    setHoveredIdx(idx);
  };
  const handleImageLeave = (idx) => {
    setHoveredIdx((cur) => (cur === idx ? null : cur));
  };

  const hoveredSrc = hoveredIdx !== null ? images[hoveredIdx] : null;
  const anyHovered = hoveredIdx !== null;

  return (
    <Box ref={ containerRef } sx={ { position: 'relative', width: '100%', height: '400vh' } }>
      <Box
        ref={ stageRef }
        onMouseMove={ handleMouseMove }
        onMouseLeave={ handleMouseLeave }
        sx={ {
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'background.default',
          /** CSS 변수 초기값 (JS 갱신) */
          '--p': 0,
          '--mx': 0,
          '--my': 0,
        } }
      >
        {/* Layer 0a: hover backdrop blur (Hero 시각 효과 보존, progress < 0.4 활성) */}
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
            opacity: anyHovered
              ? 'min(0.65, max(0, (0.4 - var(--p, 0)) / 0.4 * 0.65))'
              : 0,
            transition: 'opacity 360ms ease',
            pointerEvents: 'none',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'opacity 200ms linear',
            },
          } }
        />
        {/* Layer 0b: hover backdrop overlay (배경 가독성 보강) */}
        <Box
          aria-hidden
          sx={ {
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            backgroundColor: 'background.default',
            opacity: anyHovered
              ? 'min(0.35, max(0, (0.4 - var(--p, 0)) / 0.4 * 0.35))'
              : 0,
            transition: 'opacity 360ms ease',
            pointerEvents: 'none',
          } }
        />

        {/* Layer 1: 단일 이미지 레이어 (BridgeMarquee 가 책임. scatter↔marquee 보간 + loop) */}
        { stageSize.w > 0 && (
          <BridgeMarquee
            rows={ marqueeRows }
            isPlaying={ isPlaying }
            onImageEnter={ handleImageEnter }
            onImageLeave={ handleImageLeave }
          />
        ) }
      </Box>

      {/* Hero content — 컨테이너 첫 100vh 영역에 자연 배치 (자연 스크롤로 위로 사라짐) */}
      <Box
        sx={ {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          zIndex: 5,
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

      {/* Bridge text — 컨테이너 200~300vh 영역에 자연 배치 (자연 스크롤로 등장) */}
      <Box
        sx={ {
          position: 'absolute',
          top: '200vh',
          left: 0,
          right: 0,
          height: '100vh',
          zIndex: 5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 3,
          pointerEvents: 'none',
        } }
      >
        <Box
          sx={ {
            position: 'relative',
            maxWidth: 760,
            py: 4,
            px: 5,
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: -24,
              background: (theme) =>
                `radial-gradient(ellipse at center, ${ theme.palette.background.default } 35%, transparent 75%)`,
              zIndex: -1,
            },
          } }
        >
          <Typography
            variant="h3"
            align="center"
            sx={ {
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.4,
              fontSize: {
                xs: 'clamp(22px, 5vw, 28px)',
                md: 'clamp(28px, 3.2vw, 40px)',
              },
              color: 'text.primary',
            } }
          >
            { bridgeLine1 }<br />
            { bridgeLine2 }
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
