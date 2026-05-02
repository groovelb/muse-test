import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { ReferenceCard } from '../card/ReferenceCard.jsx';

/** 비율 동일 (4:5, 736x920) 3장 */
import img1 from '../../assets/example/213923458a6349a228e888fc5ce9bde5.jpg';
import img2 from '../../assets/example/55f247b3e73bb80f77bbde407a6c4bce.jpg';
import img3 from '../../assets/example/60ced5ca-c99e-421b-a500-3797c535a254.jpeg';

/**
 * 사전 분석 fixtures.
 * 실시간 T1 호출 대신 랜딩 데모용으로 미리 큐레이션한 결과.
 * 이미지 시각 특성을 사람이 보고 직접 작성한 plausible T1 출력 형태.
 */
const FIXTURES = [
  {
    id: 'sol1-a',
    src: img1,
    title: 'Bold Red Manifesto',
    tags: ['bold-typography', 'poster', 'monochrome-accent', 'statement'],
    dominantColors: ['#D7252A', '#0A0A0A', '#9C1B1F'],
  },
  {
    id: 'sol1-b',
    src: img2,
    title: 'Technical Grid System',
    tags: ['monospace', 'technical', 'grid-system', 'futuristic'],
    dominantColors: ['#E5E7E8', '#15171A', '#9DA3A8'],
  },
  {
    id: 'sol1-c',
    src: img3,
    title: 'Editorial Lookbook',
    tags: ['editorial', 'minimal', 'lookbook', 'grid-typography'],
    dominantColors: ['#EFEDE7', '#3A3936', '#1A1817'],
  },
];

const LAYER_LABELS = ['Color', 'Typography', 'Layout', 'Gradient', 'Visual'];

const INIT_STATUSES = ['running', 'pending', 'pending', 'pending', 'pending'];
const ALL_DONE = ['done', 'done', 'done', 'done', 'done'];

/** 현재 running 인 layer 를 done 처리하고 다음 layer 를 running 으로 advance */
function advanceStatuses(prev) {
  const idx = prev.findIndex((s) => s === 'running');
  if (idx === -1) return prev;
  const next = [...prev];
  next[idx] = 'done';
  if (idx + 1 < next.length) next[idx + 1] = 'running';
  return next;
}

/**
 * Solution1Section 템플릿
 *
 * 랜딩 솔루션 #1 섹션. 타이틀 + 설명 텍스트 + ReferenceCard 3장.
 * 분석 결과는 사전 정의된 fixtures (실시간 T1 호출 X). 섹션이 viewport 에
 * 처음 들어왔을 때 IntersectionObserver 로 1회 트리거되어 로딩 → 결과 시퀀스를 재생.
 *
 * 시퀀스 (트리거 후, 카드별 cascading delay):
 *   t=0     state=1, layer 1/5 running
 *   t=900   layer 2/5 running
 *   t=1800  layer 3/5 running
 *   t=2700  layer 4/5 running
 *   t=3600  layer 5/5 running
 *   t=4500  state=2 (모든 layer done + fixture 결과 표시)
 *
 * Props:
 * @param {object[]} samples [Optional, 기본값: 4:5 example 3장]
 *   - { id, src, title, tags, dominantColors }
 *
 * Example usage:
 * <Solution1Section />
 */
export function Solution1Section({ samples = FIXTURES }) {
  const sectionRef = useRef(null);
  const triggeredRef = useRef(false);

  const [items, setItems] = useState(() =>
    samples.map((s) => ({
      id: s.id,
      src: s.src,
      state: 1,
      layerStatuses: [...INIT_STATUSES],
      title: '',
      tags: [],
      dominantColors: [],
    })),
  );

  /** viewport 진입 시 1회 트리거 + 카드별 cascading 로딩→완료 시퀀스 재생 */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const timers = [];
    let cancelled = false;

    const startSequence = () => {
      samples.forEach((sample, idx) => {
        const cardStartDelay = idx * 250; // cascading 0/250/500ms

        // 4번 layer advance tick
        for (let k = 1; k <= 4; k += 1) {
          const t = setTimeout(() => {
            if (cancelled) return;
            setItems((prev) =>
              prev.map((it, i) =>
                i === idx
                  ? { ...it, layerStatuses: advanceStatuses(it.layerStatuses) }
                  : it,
              ),
            );
          }, cardStartDelay + k * 900);
          timers.push(t);
        }

        // 마지막 layer done + 결과 표시
        const tDone = setTimeout(() => {
          if (cancelled) return;
          setItems((prev) =>
            prev.map((it, i) =>
              i === idx
                ? {
                  ...it,
                  state: 2,
                  layerStatuses: ALL_DONE,
                  title: sample.title,
                  tags: sample.tags,
                  dominantColors: sample.dominantColors,
                }
                : it,
            ),
          );
        }, cardStartDelay + 4500);
        timers.push(tDone);
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !triggeredRef.current) {
            triggeredRef.current = true;
            startSequence();
            io.disconnect();
          }
        });
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      io.disconnect();
    };
  }, [samples]);

  return (
    <Box
      component="section"
      ref={ sectionRef }
      sx={ {
        py: { xs: 8, md: 14 },
        px: { xs: 3, md: 4 },
        backgroundColor: 'background.default',
      } }
    >
      <Box sx={ { maxWidth: 1200, mx: 'auto' } }>
        <Box sx={ { textAlign: 'center', mb: { xs: 6, md: 10 } } }>
          <Typography
            variant="h2"
            sx={ {
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              mb: 3,
              fontSize: {
                xs: 'clamp(28px, 6vw, 36px)',
                md: 'clamp(36px, 4vw, 56px)',
              },
            } }
          >
            정확한 분류 체계로 레퍼런스를 관리하세요
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={ {
              maxWidth: 760,
              mx: 'auto',
              lineHeight: 1.7,
            } }
          >
            업로드 한 장이 들어오면 같은 5 layer 격자 (color, typography, layout, gradient, visual direction) 로 자동 분류됩니다. 분류가 같아야 비교, 합성, 추적이 가능합니다.
          </Typography>
        </Box>

        <Grid container spacing={ { xs: 3, md: 4 } } justifyContent="center">
          { items.map((it) => (
            <Grid key={ it.id } size={ { xs: 12, sm: 6, md: 4 } }>
              <ReferenceCard
                src={ it.src }
                title={ it.title }
                tags={ it.tags }
                dominantColors={ it.dominantColors }
                state={ it.state }
                analyzingVariant="strip"
                layerStatuses={ it.layerStatuses }
                layerLabels={ LAYER_LABELS }
                mediaRatio="auto"
              />
            </Grid>
          )) }
        </Grid>
      </Box>
    </Box>
  );
}
