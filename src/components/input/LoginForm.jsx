import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useSignIn } from '../../hooks/auth/useSignIn.js';

/**
 * LoginForm
 *
 * 이메일 + 비밀번호 로그인 폼. 자체 검증 + useSignIn 훅 호출.
 * 라우팅은 부모 (onSignedIn) 책임.
 *
 * Props:
 * @param {function} onSignedIn - 로그인 성공 후 호출 (user 인자) [Optional]
 * @param {function} onSwitchToSignUp - "회원가입으로" 링크 클릭 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <LoginForm
 *   onSignedIn={ () => navigate('/archive') }
 *   onSwitchToSignUp={ () => setMode('signup') }
 * />
 */
export function LoginForm({ onSignedIn, onSwitchToSignUp, sx }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });
  const { signIn, loading, error } = useSignIn();

  const emailError = touched.email && !email ? '이메일을 입력해주세요.' : '';
  const passwordError = touched.password && password.length < 8 ? '비밀번호는 8자 이상' : '';

  const isValid = email && password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;
    try {
      const user = await signIn(email, password);
      onSignedIn?.(user);
    } catch {
      /* error 상태는 useSignIn 이 보유 */
    }
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { width: '100%', ...sx } }>
      <Stack spacing={ 2.5 }>
        <Box>
          <Typography variant="h5" sx={ { fontWeight: 600, mb: 0.5 } }>로그인</Typography>
          <Typography variant="body2" color="text.secondary">
            이메일과 비밀번호로 로그인하세요.
          </Typography>
        </Box>

        { error && <Alert severity="error">{ error }</Alert> }

        <TextField
          label="이메일"
          type="email"
          autoComplete="email"
          value={ email }
          onChange={ (e) => setEmail(e.target.value) }
          onBlur={ () => setTouched((p) => ({ ...p, email: true })) }
          error={ !!emailError }
          helperText={ emailError || ' ' }
          fullWidth
          required
        />

        <TextField
          label="비밀번호"
          type="password"
          autoComplete="current-password"
          value={ password }
          onChange={ (e) => setPassword(e.target.value) }
          onBlur={ () => setTouched((p) => ({ ...p, password: true })) }
          error={ !!passwordError }
          helperText={ passwordError || '8자 이상' }
          fullWidth
          required
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={ loading }
          fullWidth
        >
          { loading ? '로그인 중...' : '로그인' }
        </Button>

        { onSwitchToSignUp && (
          <Box sx={ { display: 'flex', justifyContent: 'center', pt: 0.5 } }>
            <Typography variant="body2" color="text.secondary">
              계정이 없으신가요?{ ' ' }
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={ onSwitchToSignUp }
                sx={ { fontWeight: 600 } }
              >
                회원가입
              </Link>
            </Typography>
          </Box>
        ) }
      </Stack>
    </Box>
  );
}
