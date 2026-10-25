import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HistoryIcon from '@mui/icons-material/History';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getSubjects, getQuestions, getAttempts } from '../utils/storage';
import type { ExamAttempt } from '../utils/storage';

interface DashboardProps {
  username: string;
  onNavigate: (page: string) => void;
}

function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {label}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>{icon}</Avatar>
      </Box>
    </Paper>
  );
}

function attemptGrade(pct: number) {
  if (pct >= 90) return { label: 'Excellent', color: 'success' as const };
  if (pct >= 75) return { label: 'Good', color: 'primary' as const };
  if (pct >= 50) return { label: 'Average', color: 'warning' as const };
  return { label: 'Needs Work', color: 'error' as const };
}

export default function Dashboard({ username, onNavigate }: DashboardProps) {
  const subjects = useMemo(() => getSubjects(), []);
  const questions = useMemo(() => getQuestions(), []);
  const attempts = useMemo(() => getAttempts(), []);

  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.percentage)) : 0;
  const recentAttempts = attempts.slice(0, 5);

  const subjectCounts = useMemo(() => {
    const map: Record<string, number> = {};
    questions.forEach((q) => {
      map[q.subject] = (map[q.subject] ?? 0) + 1;
    });
    return map;
  }, [questions]);

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Welcome back, {username}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ready to practice? Choose a subject and start an exam below.
          </Typography>
        </Box>

        {/* Stats row */}
        <Grid container spacing={3} mb={4}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Subjects" value={subjects.length} icon={<SchoolIcon />} color="primary.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Total Questions" value={questions.length} icon={<QuizIcon />} color="secondary.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard label="Attempts" value={attempts.length} icon={<HistoryIcon />} color="info.main" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              label="Best Score"
              value={attempts.length ? `${Math.round(bestScore)}%` : 'N/A'}
              icon={<EmojiEventsIcon />}
              color="warning.main"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {/* Subjects */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                  Available Subjects
                </Typography>
                <Button size="small" variant="contained" startIcon={<PlayArrowIcon />} onClick={() => onNavigate('setup')}>
                  Start Exam
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {subjects.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No subjects yet. Add questions to get started.
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {subjects.map((subject) => (
                    <Box
                      key={subject}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                        transition: 'background-color 0.2s',
                      }}
                      onClick={() => onNavigate('setup')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                          {subject[0]}
                        </Avatar>
                        <Typography fontWeight={600}>{subject}</Typography>
                      </Box>
                      <Chip label={`${subjectCounts[subject] ?? 0} Qs`} size="small" color="primary" variant="outlined" />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Recent attempts */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Recent Attempts
                </Typography>
              </Box>
              <Divider sx={{ mb: 1 }} />

              {recentAttempts.length === 0 ? (
                <Box textAlign="center" py={6}>
                  <QuizIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary" gutterBottom>
                    No attempts yet
                  </Typography>
                  <Button variant="contained" onClick={() => onNavigate('setup')}>
                    Take Your First Exam
                  </Button>
                </Box>
              ) : (
                <List disablePadding>
                  {recentAttempts.map((attempt: ExamAttempt, idx) => {
                    const grade = attemptGrade(attempt.percentage);
                    const date = new Date(attempt.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });
                    return (
                      <React.Fragment key={attempt.id}>
                        {idx > 0 && <Divider component="li" />}
                        <ListItem disablePadding sx={{ py: 1.5 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: `${grade.color}.light`, color: `${grade.color}.dark` }}>
                              <CheckCircleIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography fontWeight={600}>{attempt.subject}</Typography>
                                <Chip label={grade.label} size="small" color={grade.color} />
                              </Box>
                            }
                            secondary={`${attempt.score}/${attempt.total} correct · ${date}`}
                          />
                          <Typography variant="h6" fontWeight={800} color={`${grade.color}.main`}>
                            {Math.round(attempt.percentage)}%
                          </Typography>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
