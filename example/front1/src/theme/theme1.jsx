import { defaultTheme } from 'react-admin';
import { deepmerge } from '@mui/utils';
import { indigo, pink, red, blue, lightBlue, blueGrey } from '@mui/material/colors';

const theme1 = deepmerge(defaultTheme, {
  palette: {
    primary: blue,
    secondary: pink,
    error: red,
    contrastThreshold: 1,
    tonalOffset: 0.2,
  },
  typography: {
    fontFamily: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Arial', 'sans-serif'].join(','),
  },
  components: {
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