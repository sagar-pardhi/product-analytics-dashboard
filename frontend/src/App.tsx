import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { store } from './store';
import Dashboard from './pages/Dashboard';

const theme = createTheme({
  palette: {
    primary: { main: '#3b82f6' },
    secondary: { main: '#8b5cf6' },
    background: { default: '#f8fafc' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", sans-serif',
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: { defaultProps: { elevation: 0 }, styleOverrides: { root: { border: '1px solid #e2e8f0' } } },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Dashboard />
      </ThemeProvider>
    </Provider>
  );
}
