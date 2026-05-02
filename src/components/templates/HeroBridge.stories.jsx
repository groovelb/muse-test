import { HeroBridge } from './HeroBridge.jsx';

export default {
  title: 'Template/HeroBridge',
  component: HeroBridge,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## HeroBridge

Hero (scatter + 브랜드/CTA) 와 Bridge (질문 텍스트 + 4행 marquee) 를 sticky stage 1개 안에서
스크롤 진행률(\`--p\`) 기반으로 cross-fade 전환합니다.

### 구간
- \`0 ~ 100vh\` scroll: 진행률 0 (Hero 정적)
- \`100~200vh\` scroll: 진행률 0→1 (scatter→4행 row 보간 + 텍스트 cross-fade)
- \`200~300vh\` scroll: 진행률 1 (Bridge fullscreen 정적, marquee loop)

### 핵심 기법
- **CSS 변수 + calc 보간**: React state 없이 \`--p\` 만 갱신해 19장 이미지 좌표 동시 보간.
- **Marquee 무한 loop**: 동일 image 세트 2번 반복 + \`translateX(0 ↔ -50%)\`.
- **prefers-reduced-motion**: marquee animation 비활성, 보간 transition 비활성.

스토리북에서는 스크롤 인터랙션이 제한되므로 실제 라우팅 페이지(\`/\`) 에서 검증하세요.
        `,
      },
    },
  },
  argTypes: {
    brandName: { control: 'text' },
    tagline: { control: 'text' },
    bridgeLine1: { control: 'text' },
    bridgeLine2: { control: 'text' },
    seed: { control: { type: 'number' } },
    onPrimaryCta: { action: 'primaryCta' },
  },
};

export const Default = {
  args: {
    brandName: 'MUSE',
    tagline: '바이브 디자인을 위한 영감을 관리하세요',
    bridgeLine1: '레퍼런스로 만든 AI 의 디자인,',
    bridgeLine2: '얼마나 이해하고 계신가요?',
    seed: 7,
  },
};

export const AltSeed = {
  args: {
    ...Default.args,
    seed: 42,
  },
  parameters: {
    docs: { description: { story: '시드 변경 시 scatter 좌표 패턴 변화.' } },
  },
};
