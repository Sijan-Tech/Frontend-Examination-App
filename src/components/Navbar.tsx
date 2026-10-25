import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import SchoolIcon from '@mui/icons-material/School';
import LogoutIcon from '@mui/icons-material/Logout';
import DashboardIcon from '@mui/icons-material/Dashboard';
import QuizIcon from '@mui/icons-material/Quiz';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import { clearProfile } from '../utils/storage';

interface NavbarProps {
  username: string;
  page: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { key: 'setup', label: 'New Exam', icon: <QuizIcon fontSize="small" /> },
  { key: 'manage', label: 'Manage Questions', icon: <ManageSearchIcon fontSize="small" /> },
];

export default function Navbar({ username, page, onNavigate }: NavbarProps) {
  const handleLogout = () => {
    clearProfile();
    onNavigate('login');
  };

  return (
    <AppBar position="sticky" elevation={2}>
      <Toolbar sx={{ gap: 1 }}>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 700, mr: 3, cursor: 'pointer', flexShrink: 0 }}
          onClick={() => onNavigate('dashboard')}
        >
          ExamPro
        </Typography>

        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, flexGrow: 1 }}>
          {navItems.map((item) => (
            <Button
              key={item.key}
              color="inherit"
              startIcon={item.icon}
              onClick={() => onNavigate(item.key)}
              sx={{
                opacity: page === item.key ? 1 : 0.75,
                fontWeight: page === item.key ? 700 : 400,
                borderBottom: page === item.key ? '2px solid white' : '2px solid transparent',
                borderRadius: 0,
                px: 1.5,
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={username}
            size="small"
            sx={{ bgcolor: 'primary.dark', color: 'white', fontWeight: 600 }}
          />
          <Button
            color="inherit"
            size="small"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ opacity: 0.85 }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
