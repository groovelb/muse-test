import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';

import { defaultTheme, darkTheme } from './styles/themes';
import { MuseStoreProvider, useSettingsSlice } from './store';
import { AuthGuard } from './components/layout/AuthGuard.jsx';
import {
  ProjectCreateRoute,
  ProjectDetailRoute,
  SettingsRoute,
  AppShellLayout,
  LandingRoute,
  AuthRoute,
} from './pages';

/** settings.themeMode 구독해서 light/dark/system 테마 선택 (system: OS prefers-color-scheme 추종) */
function ThemedApp({ children }) {
  const { settings } = useSettingsSlice();
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = settings?.themeMode || 'system';
  const resolvedDark = mode === 'system' ? prefersDark : mode === 'dark';
  const theme = resolvedDark ? darkTheme : defaultTheme;
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

function App() {
  return (
    <MuseStoreProvider>
      <ThemedApp>
        <BrowserRouter>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/" element={<LandingRoute />} />
            <Route path="/auth" element={<AuthRoute />} />

            {/* 보호 라우트: 로그인 필요 */}
            <Route element={<AuthGuard><AppShellLayout /></AuthGuard>}>
              {/* /archive, /projects 는 AppShellLayout 안에서 keep-alive 마운트되므로 여기서 element 미지정 */}
              <Route path="/archive" element={null} />
              <Route path="/projects" element={null} />
              <Route path="/projects/new" element={<ProjectCreateRoute />} />
              <Route path="/projects/:id" element={<ProjectDetailRoute />} />
              <Route path="/settings" element={<SettingsRoute />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ThemedApp>
    </MuseStoreProvider>
  );
}

export default App;
