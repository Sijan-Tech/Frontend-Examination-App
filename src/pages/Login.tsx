import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import SchoolIcon from '@mui/icons-material/School';
import LoginIcon from '@mui/icons-material/Login';
import { saveProfile } from '../utils/storage';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError('Please enter a username to continue.');
      return;
    }
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters.');
      return;
    }
    saveProfile({ username: trimmed, loginTime: new Date().toISOString() });
    onLogin(trimmed);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={8} sx={{ p: 5, borderRadius: 3, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SchoolIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>

          <Typography variant="h4" fontWeight={700} gutterBottom>
            ExamPro
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Online Examination Practice Platform
          </Typography>

          <Alert severity="info" sx={{ mb: 3, textAlign: 'left', fontSize: '0.8rem' }}>
            Demo mode: questions and results are stored in your browser only and are not synced across devices.
          </Alert>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              error={!!error}
              helperText={error || ' '}
              autoFocus
              autoComplete="username"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              startIcon={<LoginIcon />}
              sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
            >
              Enter Practice Mode
            </Button>
          </Box>

          <Typography variant="caption" color="text.disabled" display="block" mt={3}>
            No password required — this is a local demo environment.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
