import React, { useState, useMemo } from 'react';
import { defaultTheme, Menu, AppBar, Logout, UserMenu, useSidebarState, useTranslate } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { red, blue, green, grey } from '@mui/material/colors';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  List,
  MenuItem,
  ListItemIcon,
  Collapse,
  Tooltip,
  Divider
} from '@mui/material';
import { Icon } from '@iconify/react';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useAdminContext } from 'yaml-admin-front';

export const theme = deepmerge(defaultTheme, {
  
  palette: {
    primary: {
      main: green[600],
      light: green[400],
      dark: green[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: green[700],
      light: green[500],
      dark: green[900],
    },
    error: red,
    tonalOffset: 0.2,
    background: {
      default: '#f8faf8',
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
          borderColor: green[600],
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
          <Icon icon="mdi:shield-check" width="28" height="28" color={green[600]} />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${green[700]} 0%, ${green[500]} 100%)`,
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
            backgroundColor: green[100],
            color: green[800],
            fontWeight: 600,
            fontSize: '10px',
            height: 20,
          }}
        />
      </Box>
    </AppBar>
  );
};

// ===== Export custom layout components for YMLAdmin =====
export const customLayout = {
  appName: 'Smart School Safety',
  AppBar: CustomAppBar,
  // Menu: CustomMenu,
};
