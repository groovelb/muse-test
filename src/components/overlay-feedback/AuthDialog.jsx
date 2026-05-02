import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CloseIcon from '@mui/icons-material/Close';
import { LoginForm } from '../input/LoginForm.jsx';
import { SignUpForm } from '../input/SignUpForm.jsx';

/**
 * AuthDialog
 *
 * 회원가입 / 로그인 탭 모달. 기존 SignUpForm / LoginForm 을 재사용합니다.
 * 성공 시 onAuthenticated 호출 + 자동 닫힘.
 *
 * Props:
 * @param {boolean} open - 모달 표시 여부 [Required]
 * @param {function} onClose - 닫기 콜백 [Required]
 * @param {'signup'|'signin'} initialTab - 초기 탭 [Optional, 기본값: 'signup']
 * @param {function} onAuthenticated - 가입/로그인 성공 후 호출 (user 인자) [Optional]
 *
 * Example usage:
 * <AuthDialog
 *   open={ open }
 *   onClose={ () => setOpen(false) }
 *   initialTab="signup"
 *   onAuthenticated={ (user) => navigate('/archive') }
 * />
 */
export function AuthDialog({
  open,
  onClose,
  initialTab = 'signup',
  onAuthenticated,
}) {
  const [tab, setTab] = useState(initialTab);

  /** 모달이 새로 열릴 때 initialTab 동기화 */
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const handleAuthenticated = (user) => {
    onAuthenticated?.(user);
    onClose?.();
  };

  return (
    <Dialog
      open={ open }
      onClose={ onClose }
      maxWidth="xs"
      fullWidth
      aria-labelledby="auth-dialog-tabs"
      PaperProps={ { sx: { borderRadius: 2 } } }
    >
      <Box sx={ { position: 'relative' } }>
        <IconButton
          onClick={ onClose }
          aria-label="닫기"
          size="small"
          sx={ {
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            color: 'text.secondary',
          } }
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Tabs
          id="auth-dialog-tabs"
          value={ tab }
          onChange={ (_, v) => setTab(v) }
          variant="fullWidth"
          aria-label="인증 방식 선택"
          sx={ { borderBottom: 1, borderColor: 'divider' } }
        >
          <Tab value="signup" label="회원가입" />
          <Tab value="signin" label="로그인" />
        </Tabs>

        <DialogContent sx={ { p: { xs: 3, sm: 4 } } }>
          { tab === 'signup' ? (
            <SignUpForm
              onSignedUp={ handleAuthenticated }
              onSwitchToLogin={ () => setTab('signin') }
            />
          ) : (
            <LoginForm
              onSignedIn={ handleAuthenticated }
              onSwitchToSignUp={ () => setTab('signup') }
            />
          ) }
        </DialogContent>
      </Box>
    </Dialog>
  );
}
