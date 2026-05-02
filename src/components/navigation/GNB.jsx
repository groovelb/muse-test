import { useState, forwardRef, createContext, useContext } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * GNB Context
 */
const GNBContext = createContext({
  isDrawerOpen: false,
  toggleDrawer: () => {},
  closeDrawer: () => {},
  isMobile: false,
});

export const useGNB = () => useContext(GNBContext);

/**
 * GNB 컴포넌트
 *
 * 반응형 GNB (Global Navigation Bar).
 * 데스크탑에서는 헤더에 네비게이션을 표시하고,
 * 모바일에서는 햄버거 메뉴 + 드로어로 전환된다.
 *
 * 우측 정렬 레이아웃:
 *   [logo] ........... [persistent] [navContent / hamburger] [user avatar dropdown]
 *
 * `user` prop 이 truthy 이면 우측 끝에 아바타가 표시되고, 클릭 시 드롭다운 메뉴가 열림:
 *   - 세팅
 *   - 테마 설정 (light / dark / system 토글)
 *   - 로그아웃
 *
 * Props:
 * @param {node} logo - 로고 영역 (항상 표시) [Optional]
 * @param {node} navContent - 네비게이션 콘텐츠 (반응형 전환 대상) [Optional]
 * @param {node} persistent - 헤더에 항상 표시될 요소 [Optional]
 * @param {node} drawerHeader - 드로어 상단 커스텀 요소 [Optional]
 * @param {node} drawerFooter - 드로어 하단 커스텀 요소 [Optional]
 * @param {object} user - 사용자 객체. truthy 면 우측 아바타 드롭다운 표시 { name?, email?, avatarUrl? } [Optional]
 * @param {function} onSettings - 드롭다운 "세팅" 클릭 [Optional]
 * @param {function} onSignOut - 드롭다운 "로그아웃" 클릭 [Optional]
 * @param {'light'|'dark'|'system'} themeMode - 현재 테마 모드 [Optional, 기본값: 'system']
 * @param {function} onThemeModeChange - 테마 모드 변경 (next) => void [Optional]
 * @param {string} breakpoint - 반응형 전환 브레이크포인트 ('sm' | 'md' | 'lg') [Optional, 기본값: 'md']
 * @param {number} height - 헤더 높이 (px) [Optional, 기본값: 64]
 * @param {number} drawerWidth - 드로어 너비 (px) [Optional, 기본값: 280]
 * @param {boolean} hasBorder - 헤더 하단 보더 [Optional, 기본값: true]
 * @param {boolean} isSticky - 헤더 고정 [Optional, 기본값: true]
 * @param {boolean} isTransparent - 헤더 투명 배경 [Optional, 기본값: false]
 * @param {boolean} isGhost - ghost 모드 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <GNB
 *   logo={ <Logo /> }
 *   navContent={ <NavMenu items={ menuItems } /> }
 *   user={ user }
 *   onSettings={ () => navigate('/settings') }
 *   onSignOut={ signOut }
 *   themeMode={ settings.themeMode }
 *   onThemeModeChange={ (m) => updateSettings({ themeMode: m }) }
 * />
 */
const GNB = forwardRef(function GNB({
  logo,
  navContent,
  persistent,
  drawerHeader,
  drawerFooter,
  user,
  onSettings,
  onSignOut,
  themeMode = 'system',
  onThemeModeChange,
  breakpoint = 'md',
  height = 64,
  drawerWidth = 280,
  hasBorder = true,
  isSticky = true,
  isTransparent = false,
  isGhost = false,
  sx,
  ...props
}, ref) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [userAnchor, setUserAnchor] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);
  const closeDrawer = () => setIsDrawerOpen(false);

  const openUserMenu = (e) => setUserAnchor(e.currentTarget);
  const closeUserMenu = () => setUserAnchor(null);

  const handleSettings = () => {
    closeUserMenu();
    onSettings?.();
  };
  const handleSignOut = () => {
    closeUserMenu();
    onSignOut?.();
  };
  const handleThemeChange = (_e, next) => {
    if (next == null) return;
    onThemeModeChange?.(next);
  };

  /** 헤더 스타일 */
  const headerStyles = {
    position: isSticky ? 'sticky' : 'relative',
    top: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height,
    px: { xs: 2, sm: 3, md: 4 },
    backgroundColor: isGhost ? 'transparent' : (isTransparent ? 'transparent' : 'background.paper'),
    borderBottom: !isGhost && hasBorder ? '1px solid' : 'none',
    borderColor: 'divider',
    backdropFilter: isGhost ? 'none' : (isTransparent ? 'blur(12px)' : 'none'),
    ...sx,
  };

  /** 아바타 이니셜 추출 (이름 → 첫 글자, 없으면 이메일 첫 글자) */
  const initials = (() => {
    if (!user) return '';
    const src = user.name || user.email || '';
    return src.trim().charAt(0).toUpperCase() || '?';
  })();

  /** 드로어 콘텐츠 */
  const renderDrawerContent = () => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: drawerWidth,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        {drawerHeader || logo}
        <IconButton onClick={closeDrawer} size="small" aria-label="Close menu">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', py: 2, px: 2 }}>
        {navContent}
      </Box>

      {drawerFooter && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
          {drawerFooter}
        </Box>
      )}
    </Box>
  );

  /** 우측 user avatar dropdown */
  const renderUserMenu = () => {
    if (!user) return null;
    return (
      <>
        <IconButton
          onClick={openUserMenu}
          size="small"
          aria-label="사용자 메뉴 열기"
          aria-haspopup="true"
          aria-expanded={Boolean(userAnchor)}
          sx={{ p: 0.5 }}
        >
          <Avatar
            src={user.avatarUrl || undefined}
            alt={user.name || user.email || 'user'}
            sx={{
              width: 32,
              height: 32,
              fontSize: 14,
              fontWeight: 600,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            {initials}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={userAnchor}
          open={Boolean(userAnchor)}
          onClose={closeUserMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 240, mt: 1 } } }}
        >
          {(user.name || user.email) && (
            <Box sx={{ px: 2, pt: 1, pb: 1.25 }}>
              {user.name && (
                <Box sx={{ fontWeight: 600, fontSize: 14, color: 'text.primary' }}>
                  {user.name}
                </Box>
              )}
              {user.email && (
                <Box sx={{ fontSize: 12, color: 'text.secondary', wordBreak: 'break-all' }}>
                  {user.email}
                </Box>
              )}
            </Box>
          )}
          <Divider />

          <MenuItem onClick={handleSettings}>
            <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="세팅" />
          </MenuItem>

          <Divider />

          <ListSubheader
            sx={{ lineHeight: '32px', fontSize: 11, color: 'text.secondary', bgcolor: 'transparent' }}
          >
            테마 설정
          </ListSubheader>
          <Box sx={{ px: 2, pb: 1 }}>
            <ToggleButtonGroup
              value={themeMode}
              exclusive
              onChange={handleThemeChange}
              size="small"
              fullWidth
              aria-label="테마 모드"
            >
              <ToggleButton value="light" aria-label="라이트">
                <LightModeOutlinedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="dark" aria-label="다크">
                <DarkModeOutlinedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="system" aria-label="시스템">
                <SettingsBrightnessOutlinedIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider />

          <MenuItem onClick={handleSignOut}>
            <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="로그아웃" />
          </MenuItem>
        </Menu>
      </>
    );
  };

  return (
    <GNBContext.Provider value={{ isDrawerOpen, toggleDrawer, closeDrawer, isMobile }}>
      {/* Header */}
      <Box ref={ref} component="header" sx={headerStyles} {...props}>
        {/* Left: Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {logo}
        </Box>

        {/* Right cluster (전체 우측 정렬) */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
          {/* Persistent (always visible) */}
          {persistent}

          {/* Desktop: navContent inline */}
          {!isMobile && navContent}

          {/* Mobile: hamburger */}
          {isMobile && navContent && (
            <IconButton
              onClick={toggleDrawer}
              size="medium"
              aria-label="Open menu"
              aria-expanded={isDrawerOpen}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* User avatar dropdown (가장 우측) */}
          {renderUserMenu()}
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={closeDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {renderDrawerContent()}
      </Drawer>
    </GNBContext.Provider>
  );
});

export { GNB };
