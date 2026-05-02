import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PageContainer } from '../layout/PageContainer.jsx';
import { HeroBridge } from './HeroBridge.jsx';
import { AuthDialog } from '../overlay-feedback/AuthDialog.jsx';

const FEATURES = [
  {
    title: '레퍼런스 아카이빙',
    body: '드래그앤드롭 + URL 업로드. AI 가 색·타이포·레이아웃을 자동 태깅해 검색 가능한 자산으로 정리합니다.',
  },
  {
    title: '의도 기반 큐레이션',
    body: '5-step 위자드로 모드·의도·레퍼런스·노트를 모아, 결정의 맥락을 잃지 않고 합성합니다.',
  },
  {
    title: '결정 추적 가능한 토큰',
    body: '각 토큰의 출처 레퍼런스, 매칭 이유, 탈락 후보까지 동봉. 왜 그 색이 선택됐는지 다시 묻지 않습니다.',
  },
];

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

      {/* Features */}
      <Box
        sx={ {
          backgroundColor: 'grey.50',
          borderTop: '1px solid',
          borderColor: 'divider',
        } }
      >
        <PageContainer variant="fluid">
          <Box sx={ { py: { xs: 8, md: 12 } } }>
            <Typography
              variant="h4"
              sx={ { fontWeight: 600, letterSpacing: '-0.02em', mb: 6, maxWidth: 720 } }
            >
              레퍼런스에서 토큰까지, 결정의 맥락이 사라지지 않습니다.
            </Typography>
            <Box
              sx={ {
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 4, md: 6 },
              } }
            >
              { FEATURES.map((f, i) => (
                <Box key={ f.title }>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={ { letterSpacing: '0.16em' } }
                  >
                    0{ i + 1 }
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={ { fontWeight: 600, mt: 1, mb: 1.5 } }
                  >
                    { f.title }
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={ { lineHeight: 1.7 } }>
                    { f.body }
                  </Typography>
                </Box>
              )) }
            </Box>
          </Box>
        </PageContainer>
      </Box>

      {/* Footer CTA */}
      <PageContainer variant="fluid">
        <Box
          sx={ {
            py: { xs: 8, md: 14 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          } }
        >
          <Typography
            variant="h3"
            sx={ {
              fontWeight: 600,
              letterSpacing: '-0.02em',
              mb: 3,
              fontSize: { xs: 'clamp(28px, 6vw, 36px)', md: 'clamp(36px, 4vw, 56px)' },
            } }
          >
            오늘 첫 레퍼런스를 올려보세요
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={ { mb: 4, maxWidth: 520 } }
          >
            가입 1 분, 첫 토큰 분석까지 5 분. 카드를 등록하지 않아도 됩니다.
          </Typography>
          <Button
            onClick={ openSignup }
            variant="contained"
            color="primary"
            size="large"
            sx={ { px: 5 } }
          >
            무료로 시작하기
          </Button>
        </Box>
      </PageContainer>

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
