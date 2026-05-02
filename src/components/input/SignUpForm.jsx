import { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useSignUp } from '../../hooks/auth/useSignUp.js';

/**
 * SignUpForm
 *
 * 이메일 + 비밀번호 + 비밀번호 확인 가입 폼. 자체 검증 + useSignUp 훅 호출.
 * Confirm email OFF 합의이므로 가입 즉시 로그인 상태가 됨 → onSignedUp 호출.
 *
 * Props:
 * @param {function} onSignedUp - 가입 성공 후 호출 (user 인자) [Optional]
 * @param {function} onSwitchToLogin - "로그인으로" 링크 클릭 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SignUpForm
 *   onSignedUp={ () => navigate('/archive') }
 *   onSwitchToLogin={ () => setMode('signin') }
 * />
 */
export function SignUpForm({ onSignedUp, onSwitchToLogin, sx }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [touched, setTouched] = useState({});
  const { signUp, loading, error } = useSignUp();

  const emailError = touched.email && !email ? '이메일을 입력해주세요.' : '';
  const passwordError = touched.password && password.length < 8 ? '비밀번호는 8자 이상' : '';
  const confirmError = touched.passwordConfirm && password !== passwordConfirm
    ? '비밀번호가 일치하지 않습니다.'
    : '';

  const isValid = email && password.length >= 8 && password === passwordConfirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true, passwordConfirm: true });
    if (!isValid) return;
    try {
      const user = await signUp(email, password);
      onSignedUp?.(user);
    } catch {
      /* error 상태는 useSignUp 이 보유 */
    }
  };

  return (
    <Box component="form" onSubmit={ handleSubmit } sx={ { width: '100%', ...sx } }>
      <Stack spacing={ 2.5 }>
        <Box>
          <Typography variant="h5" sx={ { fontWeight: 600, mb: 0.5 } }>회원가입</Typography>
          <Typography variant="body2" color="text.secondary">
            이메일로 새 계정을 만드세요.
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
          autoComplete="new-password"
          value={ password }
          onChange={ (e) => setPassword(e.target.value) }
          onBlur={ () => setTouched((p) => ({ ...p, password: true })) }
          error={ !!passwordError }
          helperText={ passwordError || '8자 이상' }
          fullWidth
          required
        />

        <TextField
          label="비밀번호 확인"
          type="password"
          autoComplete="new-password"
          value={ passwordConfirm }
          onChange={ (e) => setPasswordConfirm(e.target.value) }
          onBlur={ () => setTouched((p) => ({ ...p, passwordConfirm: true })) }
          error={ !!confirmError }
          helperText={ confirmError || ' ' }
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
          { loading ? '가입 중...' : '회원가입' }
        </Button>

        { onSwitchToLogin && (
          <Box sx={ { display: 'flex', justifyContent: 'center', pt: 0.5 } }>
            <Typography variant="body2" color="text.secondary">
              이미 계정이 있으신가요?{ ' ' }
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={ onSwitchToLogin }
                sx={ { fontWeight: 600 } }
              >
                로그인
              </Link>
            </Typography>
          </Box>
        ) }
      </Stack>
    </Box>
  );
}
