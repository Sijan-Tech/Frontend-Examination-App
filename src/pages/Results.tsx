import React, { useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import LinearProgress from '@mui/material/LinearProgress';
import Alert from '@mui/material/Alert';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getAttempts } from '../utils/storage';
import type { ExamAttempt } from '../utils/storage';

interface ResultsProps {
  onRetry: () => void;
  onHome: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function getGrade(pct: number) {
  if (pct >= 90) return { label: 'Excellent', color: 'success' as const, emoji: '🏆' };
  if (pct >= 75) return { label: 'Good', color: 'primary' as const, emoji: '👍' };
  if (pct >= 50) return { label: 'Average', color: 'warning' as const, emoji: '📚' };
  return { label: 'Needs Improvement', color: 'error' as const, emoji: '💪' };
}

export default function Results({ onRetry, onHome }: ResultsProps) {
  const attempt = useMemo<ExamAttempt | null>(() => {
    const attempts = getAttempts();
    return attempts[0] ?? null;
  }, []);

  if (!attempt) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="info">No results found. Please take an exam first.</Alert>
        <Button sx={{ mt: 2 }} variant="contained" onClick={onHome}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  const grade = getGrade(attempt.percentage);
  const unansweredCount = attempt.total - Object.keys(attempt.answers).length;
  const incorrectCount = attempt.total - attempt.score - unansweredCount;

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="md">
        {/* Score card */}
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            textAlign: 'center',
            mb: 4,
            background: `linear-gradient(135deg, ${
              grade.color === 'success'
                ? '#2e7d32, #4caf50'
                : grade.color === 'primary'
                ? '#1565c0, #42a5f5'
                : grade.color === 'warning'
                ? '#e65100, #ff9800'
                : '#c62828, #ef5350'
            })`,
            color: 'white',
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: 'rgba(255,255,255,0.2)',
              mx: 'auto',
              mb: 2,
              fontSize: '2.5rem',
            }}
          >
            <EmojiEventsIcon sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h3" fontWeight={900} gutterBottom>
            {Math.round(attempt.percentage)}%
          </Typography>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {grade.label}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }} gutterBottom>
            {attempt.subject} · {new Date(attempt.date).toLocaleDateString()}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={attempt.percentage}
            sx={{ mt: 2, height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.3)', '& .MuiLinearProgress-bar': { bgcolor: 'white' } }}
          />
        </Paper>

        {/* Stats grid */}
        <Grid container spacing={2} mb={4}>
          {[
            { label: 'Score', value: `${attempt.score}/${attempt.total}`, icon: <CheckCircleIcon />, color: 'success.main' },
            { label: 'Correct', value: attempt.score, icon: <CheckCircleIcon />, color: 'success.main' },
            { label: 'Incorrect', value: incorrectCount, icon: <CancelIcon />, color: 'error.main' },
            { label: 'Unanswered', value: unansweredCount, icon: <RemoveCircleIcon />, color: 'text.secondary' },
            { label: 'Time Taken', value: formatTime(attempt.timeTaken), icon: null, color: 'info.main' },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 6, sm: 4, md: 'auto' }} sx={{ flexGrow: 1 }}>
              <Paper elevation={2} sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', height: '100%' }}>
                <Typography variant="h5" fontWeight={800} color={stat.color}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
          <Button variant="outlined" startIcon={<HomeIcon />} onClick={onHome} size="large">
            Dashboard
          </Button>
          <Button variant="contained" startIcon={<ReplayIcon />} onClick={onRetry} size="large">
            Retry Exam
          </Button>
        </Box>

        {/* Detailed review */}
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Detailed Review
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {attempt.questions.map((q, idx) => {
          const userAnswer = attempt.answers[q.id];
          const isCorrect = userAnswer === q.correctAnswer;
          const isUnanswered = !userAnswer;
          const isMarked = attempt.markedForReview.includes(q.id);

          return (
            <Accordion key={q.id} elevation={1} sx={{ mb: 1, borderRadius: '8px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%', pr: 1 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: isUnanswered ? 'grey.300' : isCorrect ? 'success.main' : 'error.main',
                      flexShrink: 0,
                    }}
                  >
                    {isUnanswered ? (
                      <RemoveCircleIcon sx={{ fontSize: 18 }} />
                    ) : isCorrect ? (
                      <CheckCircleIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <CancelIcon sx={{ fontSize: 18 }} />
                    )}
                  </Avatar>
                  <Typography variant="body2" fontWeight={600} sx={{ flex: 1, pr: 1 }}>
                    Q{idx + 1}. {q.question}
                  </Typography>
                  {isMarked && <Chip label="Reviewed" size="small" color="warning" sx={{ flexShrink: 0 }} />}
                  <Chip
                    label={isUnanswered ? 'Skipped' : isCorrect ? 'Correct' : 'Wrong'}
                    size="small"
                    color={isUnanswered ? 'default' : isCorrect ? 'success' : 'error'}
                    sx={{ flexShrink: 0 }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0 }}>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {q.options.map((opt, i) => {
                    const isCorrectOpt = opt === q.correctAnswer;
                    const isUserOpt = opt === userAnswer;
                    return (
                      <Box
                        key={i}
                        sx={{
                          px: 2,
                          py: 1,
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: isCorrectOpt ? 'success.main' : isUserOpt && !isCorrect ? 'error.main' : 'divider',
                          bgcolor: isCorrectOpt ? 'success.50' : isUserOpt && !isCorrect ? 'error.50' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        {isCorrectOpt ? (
                          <CheckCircleIcon fontSize="small" color="success" />
                        ) : isUserOpt && !isCorrect ? (
                          <CancelIcon fontSize="small" color="error" />
                        ) : (
                          <Box sx={{ width: 20, height: 20 }} />
                        )}
                        <Typography variant="body2" fontWeight={isCorrectOpt ? 600 : 400}>
                          {opt}
                        </Typography>
                        {isUserOpt && !isCorrectOpt && (
                          <Chip label="Your answer" size="small" color="error" sx={{ ml: 'auto' }} />
                        )}
                        {isCorrectOpt && (
                          <Chip label="Correct answer" size="small" color="success" sx={{ ml: 'auto' }} />
                        )}
                      </Box>
                    );
                  })}
                </Box>
                {q.explanation && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Explanation:</strong> {q.explanation}
                    </Typography>
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Container>
    </Box>
  );
}
