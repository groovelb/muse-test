import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LoginForm } from '../input/LoginForm.jsx';
import { SignUpForm } from '../input/SignUpForm.jsx';
import { SplitScreen } from '../layout/SplitScreen.jsx';

/**
 * AuthPage 템플릿
 *
 * 좌측 브랜드 hero + 우측 폼 (LoginForm | SignUpForm) 토글.
 * 폼 동작 자체는 LoginForm / SignUpForm 가 책임. 라우팅은 부모 (onAuthenticated) 책임.
 *
 * Props:
 * @param {'signin'|'signup'} initialMode - 초기 모드 [Optional, 기본값: 'signin']
 * @param {function} onAuthenticated - 로그인/가입 성공 후 호출 (user 인자) [Optional]
 * @param {string} brandName - hero 영역 브랜드명 [Optional, 기본값: 'MUSE']
 * @param {string} brandTagline - hero 영역 태그라인 [Optional]
 *
 * Example usage:
 * <AuthPage onAuthenticated={ () => navigate('/archive') } />
 */
export function AuthPage({
  initialMode = 'signin',
  onAuthenticated,
  brandName = 'MUSE',
  brandTagline = '레퍼런스에서 디자인 토큰까지. AI 가 결정 과정을 함께 추적합니다.',
}) {
  const [mode, setMode] = useState(initialMode);

  return (
    <Box sx={ { minHeight: '100vh', backgroundColor: 'background.default' } }>
      <SplitScreen
        ratio={ 0.5 }
        stackAt="md"
        left={
          <Box
            sx={ {
              minHeight: { xs: 240, md: '100vh' },
              backgroundColor: 'grey.900',
              color: 'common.white',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              p: { xs: 4, md: 8 },
            } }
          >
            <Typography variant="overline" sx={ { letterSpacing: '0.18em', opacity: 0.7 } }>
              { brandName }
            </Typography>
            <Box sx={ { mt: { xs: 4, md: 0 } } }>
              <Typography
                variant="h2"
                sx={ {
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.05,
                  mb: 3,
                  fontSize: { xs: 'clamp(28px, 6vw, 40px)', md: 'clamp(40px, 4vw, 60px)' },
                } }
              >
                디자인 결정,<br />
                흔적으로 남기다
              </Typography>
              <Typography variant="body1" sx={ { opacity: 0.75, maxWidth: 420 } }>
                { brandTagline }
              </Typography>
            </Box>
            <Typography variant="caption" sx={ { opacity: 0.4 } }>
              © { new Date().getFullYear() } { brandName }
            </Typography>
          </Box>
        }
        right={
          <Box
            sx={ {
              minHeight: { md: '100vh' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 4, md: 6 },
            } }
          >
            <Box sx={ { width: '100%', maxWidth: 400 } }>
              { mode === 'signin' ? (
                <LoginForm
                  onSignedIn={ onAuthenticated }
                  onSwitchToSignUp={ () => setMode('signup') }
                />
              ) : (
                <SignUpForm
                  onSignedUp={ onAuthenticated }
                  onSwitchToLogin={ () => setMode('signin') }
                />
              ) }
            </Box>
          </Box>
        }
      />
    </Box>
  );
}
