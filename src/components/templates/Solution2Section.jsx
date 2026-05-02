import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { AnalysisLayerTabs } from './AnalysisLayerTabs.jsx';
import { ANALYSIS_LAYERS } from '../../data/muse/layers.js';

/** Solution1 과 동일한 3장 (4:5) — T3 분석 출처로 사용 */
import img1 from '../../assets/example/213923458a6349a228e888fc5ce9bde5.jpg';
import img2 from '../../assets/example/55f247b3e73bb80f77bbde407a6c4bce.jpg';
import img3 from '../../assets/example/60ced5ca-c99e-421b-a500-3797c535a254.jpeg';

/** 비주얼 디렉션 / DESIGN.md 탭 제외 — 4 layer 만 노출 */
const LAYERS_4 = ANALYSIS_LAYERS.filter((l) => l.id !== 'visualDirection');

/** 결정 추적 출처용 references */
const FIXTURE_REFERENCES = [
  { id: 'ref-sol1-a', thumbnailUrl: img1, title: 'Bold Red Manifesto' },
  { id: 'ref-sol1-b', thumbnailUrl: img2, title: 'Technical Grid System' },
  { id: 'ref-sol1-c', thumbnailUrl: img3, title: 'Editorial Lookbook' },
];

/**
 * 사전 큐레이션된 T3 system 모드 분석 결과.
 * Solution1 의 3 레퍼런스를 합성한 결과를 사람이 직접 작성한 plausible 출력.
 * 항목 수는 요약 수준 (color 4 / typography 3 / layout 3 / gradient 2).
 */
const FIXTURE_ANALYSIS = {
  color: [
    {
      id: 'col-signal-red',
      label: 'Signal Red',
      hex: '#D7252A',
      role: 'primary',
      group: 'Brand',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-a'],
      decisionRationale: {
        whichReferences: ['ref-sol1-a'],
        whichLayers: ['color'],
        whyChosen: '"강한 시각적 임팩트" 의도. ref-sol1-a 의 dominantColor 1순위. 명도 대비로 CTA 의 primary 역할 확보',
        alternativesConsidered: [
          { value: '#9C1B1F', reason: 'ref-sol1-a 보조 후보, 채도 낮아 visibility 약함' },
        ],
      },
    },
    {
      id: 'col-ink-noir',
      label: 'Ink Noir',
      hex: '#15171A',
      role: 'neutral',
      group: 'Neutral',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-a', 'ref-sol1-b'],
      decisionRationale: {
        whichReferences: ['ref-sol1-a', 'ref-sol1-b'],
        whichLayers: ['color'],
        whyChosen: '본문/텍스트 base. ref-a 포스터 텍스트와 ref-b 모노스페이스 라벨에 공통으로 사용된 near-black',
      },
    },
    {
      id: 'col-paper-warm',
      label: 'Paper Warm',
      hex: '#EFEDE7',
      role: 'surface',
      group: 'Surface',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-c'],
        whichLayers: ['color'],
        whyChosen: 'ref-sol1-c 의 매거진 톤 배경. 따뜻한 off-white 로 차가운 #FFFFFF 보다 편집 무드에 적합',
      },
    },
    {
      id: 'col-grid-grey',
      label: 'Grid Grey',
      hex: '#9DA3A8',
      role: 'secondary',
      group: 'Neutral',
      isEnabled: true,
      emphasis: 1,
      sourceReferenceIds: ['ref-sol1-b'],
      decisionRationale: {
        whichReferences: ['ref-sol1-b'],
        whichLayers: ['color'],
        whyChosen: 'ref-sol1-b 의 그리드 마커 / 보조 라벨 색. divider, placeholder, muted text 용 secondary',
      },
    },
  ],

  typography: [
    {
      id: 'typo-display',
      label: 'Display Bold',
      variant: 'h1',
      fontFamily: 'Outfit, sans-serif',
      fontWeight: 800,
      fontSize: '56px',
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      sampleText: 'Aa Display',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-a'],
      decisionRationale: {
        whichReferences: ['ref-sol1-a'],
        whichLayers: ['typography'],
        whyChosen: 'ref-sol1-a 의 강한 statement 헤드라인. 두께 800 + 좁은 letter-spacing 으로 매니페스토 톤 재현',
      },
    },
    {
      id: 'typo-mono-tech',
      label: 'Mono Technical',
      variant: 'overline',
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: 1.4,
      letterSpacing: '0.18em',
      sampleText: 'Aa Mono',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-b'],
      decisionRationale: {
        whichReferences: ['ref-sol1-b'],
        whichLayers: ['typography'],
        whyChosen: '메타 라벨/캡션용 모노스페이스. ref-sol1-b 의 좌표 라벨에서 채택. uppercase + 넓은 letter-spacing',
      },
    },
    {
      id: 'typo-body',
      label: 'Editorial Body',
      variant: 'body1',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 400,
      fontSize: '17px',
      lineHeight: 1.65,
      letterSpacing: '-0.005em',
      sampleText: 'Aa Body',
      isEnabled: true,
      emphasis: 1,
      sourceReferenceIds: ['ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-c'],
        whichLayers: ['typography'],
        whyChosen: 'ref-sol1-c 의 본문 무드. 17px / 1.65 line-height 로 long-read 가독성 확보',
      },
    },
  ],

  layout: [
    {
      id: 'lay-grid-12',
      label: '12 Column Grid',
      kind: 'grid',
      columns: 12,
      gap: 32,
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-c'],
        whichLayers: ['layout'],
        whyChosen: 'ref-sol1-c 의 12 column 매거진 레이아웃. gap 32 로 여백 보장',
      },
    },
    {
      id: 'lay-section-gap',
      label: 'Section Gap',
      kind: 'spacing',
      px: 120,
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-c'],
        whichLayers: ['layout'],
        whyChosen: '섹션 간 호흡. ref-sol1-c 매거진 톤 유지를 위해 96 → 120 px 로 확장',
      },
    },
    {
      id: 'lay-container',
      label: 'Editorial Container',
      kind: 'container',
      ratio: 0.85,
      maxWidth: '1280px',
      isEnabled: true,
      emphasis: 1,
      sourceReferenceIds: ['ref-sol1-b', 'ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-b', 'ref-sol1-c'],
        whichLayers: ['layout'],
        whyChosen: '본문 max-width 1280px + 0.85 ratio. ref-b 의 그리드 정렬과 ref-c 의 마진 비율 합성',
      },
    },
  ],

  gradient: [
    {
      id: 'grad-warm-paper',
      label: 'Warm Paper',
      gradient: 'linear-gradient(180deg, #EFEDE7, #D7C9B0)',
      isEnabled: true,
      emphasis: 2,
      sourceReferenceIds: ['ref-sol1-c'],
      decisionRationale: {
        whichReferences: ['ref-sol1-c'],
        whichLayers: ['gradient'],
        whyChosen: '히어로 섹션 배경 fade. ref-sol1-c 의 paper 톤을 따뜻하게 끌어내림',
      },
    },
    {
      id: 'grad-signal-fade',
      label: 'Signal Fade',
      gradient: 'linear-gradient(135deg, #D7252A, #9C1B1F)',
      isEnabled: true,
      emphasis: 1,
      sourceReferenceIds: ['ref-sol1-a'],
      decisionRationale: {
        whichReferences: ['ref-sol1-a'],
        whichLayers: ['gradient'],
        whyChosen: 'CTA hover 또는 brand banner 용. ref-sol1-a 의 시그널 레드를 약간 깊게',
      },
    },
  ],
};

/**
 * Solution2Section 템플릿
 *
 * 랜딩 솔루션 #2 섹션. 타이틀 + 설명 텍스트 + AnalysisLayerTabs 데모.
 * Solution1 에서 보여준 3 레퍼런스를 사전에 T3 system 모드로 분석한 결과를 표시.
 * IntersectionObserver 로 viewport 진입 시 fade-in.
 *
 * 비주얼 디렉션 / DESIGN.md 탭은 노출하지 않음 (color, typography, layout, gradient 4 탭).
 *
 * Props:
 * @param {object} analysis [Optional, 기본값: 사전 큐레이션 fixture]
 *   - { color, typography, layout, gradient }
 * @param {Array} references [Optional, 기본값: Solution1 의 3장]
 *
 * Example usage:
 * <Solution2Section />
 */
export function Solution2Section({
  analysis = FIXTURE_ANALYSIS,
  references = FIXTURE_REFERENCES,
}) {
  const sectionRef = useRef(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

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
            의도에 맞게 분석된 레퍼런스를 AI에게 학습시키세요
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
            추출된 토큰과 결정 추적을 DESIGN.md ZIP 으로 export. Claude, Gemini, ChatGPT 어디에 붙여넣어도 의도까지 이해한 코드를 받을 수 있습니다.
          </Typography>
        </Box>

        <Box
          sx={ {
            maxWidth: 1080,
            mx: 'auto',
            opacity: revealed ? 1 : 0,
            transform: revealed ? 'translateY(0)' : 'translateY(16px)',
            transition:
              'opacity 600ms ease, transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: { xs: 2, md: 4 },
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'opacity 200ms linear',
              transform: 'none',
            },
          } }
        >
          <AnalysisLayerTabs
            analysis={ analysis }
            references={ references }
            layers={ LAYERS_4 }
            defaultLayer="color"
          />
        </Box>
      </Box>
    </Box>
  );
}
