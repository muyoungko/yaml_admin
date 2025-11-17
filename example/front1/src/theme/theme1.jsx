import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { red, blue } from '@mui/material/colors';

const theme1 = deepmerge(defaultTheme, {
  palette: {
    primary: {
      main: blue['A700'],
      light: blue['A700'],
      dark: blue['A700'],
      contrastText: '#ffffff',
    },
    secondary: red,
    error: red,
    tonalOffset: 0.2,
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'].join(','),
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: 'none',
          border: '1px solid rgba(0,0,0,0.08)',
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
    MuiButton: {
      defaultProps: {
        
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',  
        margin: 'dense',  
      },
    },
  },
});

export default theme1;