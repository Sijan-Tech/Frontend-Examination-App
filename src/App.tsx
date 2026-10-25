import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExamSetup from './pages/ExamSetup';
import ExamRoom from './pages/ExamRoom';
import Results from './pages/Results';
import ManageQuestions from './pages/ManageQuestions';
import Navbar from './components/Navbar';
import { getProfile } from './utils/storage';

type Page = 'login' | 'dashboard' | 'setup' | 'exam' | 'results' | 'manage';

function App() {
  const [page, setPage] = useState<Page>('login');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const profile = getProfile();
    if (profile) {
      setUsername(profile.username);
      setPage('dashboard');
    }
  }, []);

  const handleLogin = (name: string) => {
    setUsername(name);
    setPage('dashboard');
  };

  const handleNavigate = (target: string) => {
    setPage(target as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (page === 'login') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {page !== 'exam' && (
          <Navbar username={username} page={page} onNavigate={handleNavigate} />
        )}

        {page === 'dashboard' && (
          <Dashboard username={username} onNavigate={handleNavigate} />
        )}
        {page === 'setup' && (
          <ExamSetup onStart={() => setPage('exam')} />
        )}
        {page === 'exam' && (
          <ExamRoom onFinish={() => setPage('results')} />
        )}
        {page === 'results' && (
          <Results
            onRetry={() => setPage('setup')}
            onHome={() => setPage('dashboard')}
          />
        )}
        {page === 'manage' && <ManageQuestions />}
      </Box>
    </ThemeProvider>
  );
}

export default App;
