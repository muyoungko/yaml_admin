import { Icon } from '@iconify/react';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Avatar
} from '@mui/material';
import { red } from '@mui/material/colors';
import { alpha } from '@mui/material/styles';
import { deepmerge } from '@mui/utils';
import React from 'react';
import { AppBar, defaultTheme, Logout, UserMenu, Login, LoginForm, useAdminContext } from 'yaml-admin-front';

// Brand Colors
const PRIMARY_MAIN = '#6C2FF2';
const PRIMARY_LIGHT = '#9D6CFF';
const PRIMARY_DARK = '#3A00B2';
const SECONDARY_MAIN = '#00E5FF'; 

export const theme = deepmerge(defaultTheme, {
  
  palette: {
    primary: {
      main: PRIMARY_MAIN,
      light: PRIMARY_LIGHT,
      dark: PRIMARY_DARK,
      contrastText: '#ffffff',
    },
    secondary: {
      main: SECONDARY_MAIN,
      light: '#6EFFFF',
      dark: '#00B2CC',
      contrastText: '#000000',
    },
    error: red,
    tonalOffset: 0.2,
    background: {
      default: '#F4F7FE',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          color: '#000',
          opacity: 0.9,
        },
        colorPrimary: {
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundImage: 'none',
        },
        colorSecondary: {
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundImage: 'none',
        },
        colorDefault: {
          backgroundColor: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundImage: 'none',
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          maxWidth: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        margin: 'dense',
        borderRadius: 10,
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: PRIMARY_MAIN,
        },
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: red[600],
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          
        },
      },
    },
  },
});

// ===== Custom AppBar Component =====
const CustomUserMenu = (props) => (
  <UserMenu {...props}>
    <Logout />
  </UserMenu>
);

const CustomAppBar = (props) => {
  return (
    <AppBar
      {...props}
      userMenu={<CustomUserMenu />}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        '& .RaAppBar-toolbar': {
          minHeight: 56,
        },
      }}
    >
      <Box flex={1} display="flex" alignItems="center" gap={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Icon icon="mdi:shield-check" width="28" height="28" color={PRIMARY_MAIN} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${SECONDARY_MAIN} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}
          >
            Smart School Safety
          </Typography>
        </Box>
        <Chip
          label="ADMIN"
          size="small"
          sx={{
            backgroundColor: alpha(PRIMARY_MAIN, 0.1),
            color: PRIMARY_MAIN,
            fontWeight: 600,
            fontSize: '10px',
            height: 20,
          }}
        />
      </Box>
    </AppBar>
  );
};

// ===== Custom Login Component =====
const CustomLoginPage = () => {
  const { yml } = useAdminContext();
  
  return (
    <Login
      backgroundImage={yml?.front?.appearance?.login?.background}
      sx={{
        background: !yml?.front?.appearance?.login?.background ? `linear-gradient(135deg, ${alpha(PRIMARY_MAIN, 0.05)} 0%, ${alpha(SECONDARY_MAIN, 0.05)} 100%)` : undefined,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        '& .MuiPaper-root': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
        },
        '& .RaLogin-avatar': {
            display: 'none',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          backgroundColor: '#ffffff',
          p:4
        }}
      >
        <Card
          sx={{
            minWidth: 350,
            maxWidth: 400,
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255,255,255,0.9)',
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: PRIMARY_MAIN,
              borderRadius: '50%',
              padding: 2,
              boxShadow: `0 4px 20px ${alpha(PRIMARY_MAIN, 0.4)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              background: `linear-gradient(135deg, ${PRIMARY_MAIN} 0%, ${SECONDARY_MAIN} 100%)`,
            }}
          >
            <Icon icon="mdi:shield-check" width="40" height="40" color="#ffffff" />
          </Box>
          
          <CardContent sx={{ pt: 14, px: 4, pb: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: PRIMARY_MAIN,
                  mb: 1
                }}
              >
                Smart School Safety
              </Typography>
              <Typography variant="body2" color="textSecondary">
                관리자 로그인
              </Typography>
            </Box>
            
            <LoginForm />
          </CardContent>
        </Card>
        
        <Box mt={4} textAlign="center">
          <Typography variant="caption" color="textSecondary">
            © 2026 Smart School Safety System. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Login>
  );
};

// ===== Export custom layout components for YMLAdmin =====
export const customLayout = {
  appName: 'Smart School Safety',
  AppBar: CustomAppBar,
  Login: CustomLoginPage,
  // Menu: CustomMenu,
};
