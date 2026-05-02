import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PageContainer } from '../layout/PageContainer.jsx';
import { HeroBridge } from './HeroBridge.jsx';
import { Solution1Section } from './Solution1Section.jsx';
import { TagMarqueeSection } from './TagMarqueeSection.jsx';
import { Solution2Section } from './Solution2Section.jsx';
import { FooterCtaSection } from './FooterCtaSection.jsx';
import { AuthDialog } from '../overlay-feedback/AuthDialog.jsx';

/**
 * LandingPage 템플릿
 *
 * 비로그인 사용자를 위한 랜딩 페이지.
 * Hero (HeroScatter) + Features (기능 3종) + Footer CTA + AuthDialog 모달.
 * 모든 CTA 는 내부 AuthDialog 를 오픈합니다 (탭으로 가입/로그인 구분).
 *
 * Props:
 * @param {string} brandName [Optional, 기본값: 'MUSE']
 * @param {function} onAuthenticated - 가입/로그인 성공 시 호출 [Optional]
 *
 * Example usage:
 * <LandingPage onAuthenticated={ () => navigate('/archive') } />
 */
export function LandingPage({
  brandName = 'MUSE',
  onAuthenticated,
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('signup');

  const openSignup = () => {
    setAuthTab('signup');
    setAuthOpen(true);
  };
  const openLogin = () => {
    setAuthTab('signin');
    setAuthOpen(true);
  };

  return (
    <Box sx={ { backgroundColor: 'background.default', minHeight: '100vh' } }>
      {/* GNB-lite */}
      <Box
        sx={ {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: 'transparent',
        } }
      >
        <PageContainer variant="fluid">
          <Box
            sx={ {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            } }
          >
            <Typography variant="overline" sx={ { letterSpacing: '0.18em', fontWeight: 700 } }>
              { brandName }
            </Typography>
            <Stack direction="row" spacing={ 1 }>
              <Button onClick={ openLogin } size="small">로그인</Button>
              <Button onClick={ openSignup } variant="contained" size="small">시작하기</Button>
            </Stack>
          </Box>
        </PageContainer>
      </Box>

      {/* Hero + Bridge (sticky stage 1개로 통합. 이미지 위치 끊김 0 + marquee loop) */}
      <HeroBridge
        brandName={ brandName }
        onPrimaryCta={ openSignup }
      />

      {/* Solution #1: 5 layer 분류 + T1 자동 태깅 데모 */}
      <Solution1Section />

      {/* T1 어휘 3행 marquee (left ↔ right ↔ left) */}
      <TagMarqueeSection />

      {/* Solution #2: T3 system 모드 분석 결과 (AnalysisLayerTabs) */}
      <Solution2Section />

      {/* Footer CTA — Hero 배경 응용 (레퍼런스 3행 marquee) */}
      <FooterCtaSection onPrimaryCta={ openSignup } />

      {/* Footer */}
      <Box sx={ { borderTop: '1px solid', borderColor: 'divider' } }>
        <PageContainer variant="fluid">
          <Box
            sx={ {
              py: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            } }
          >
            <Typography variant="caption" color="text.secondary">
              © { new Date().getFullYear() } { brandName }
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Made for designers and engineers
            </Typography>
          </Box>
        </PageContainer>
      </Box>

      {/* Auth modal */}
      <AuthDialog
        open={ authOpen }
        onClose={ () => setAuthOpen(false) }
        initialTab={ authTab }
        onAuthenticated={ onAuthenticated }
      />
    </Box>
  );
}
