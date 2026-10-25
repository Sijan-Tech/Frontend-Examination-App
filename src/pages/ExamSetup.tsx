import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SettingsIcon from '@mui/icons-material/Settings';
import TimerIcon from '@mui/icons-material/Timer';
import QuizIcon from '@mui/icons-material/Quiz';
import { getSubjects, getQuestions, saveCurrentExam } from '../utils/storage';
import type { Question } from '../data/questions';

interface ExamSetupProps {
  onStart: () => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamSetup({ onStart }: ExamSetupProps) {
  const subjects = useMemo(() => getSubjects(), []);
  const [subject, setSubject] = useState(subjects[0] ?? '');
  const [duration, setDuration] = useState(20);
  const [questionCount, setQuestionCount] = useState(10);

  const availableQuestions = useMemo(
    () => getQuestions().filter((q) => q.subject === subject),
    [subject],
  );

  const maxCount = availableQuestions.length;

  const adjustedCount = Math.min(questionCount, maxCount);

  const handleStart = () => {
    const selected: Question[] = shuffle(availableQuestions).slice(0, adjustedCount);
    saveCurrentExam({
      subject,
      duration,
      questionCount: selected.length,
      questions: selected,
      startTime: Date.now(),
    });
    onStart();
  };

  if (subjects.length === 0) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="warning">
          No questions found. Please add some questions in the Manage Questions section first.
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <SettingsIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={800}>
            Exam Setup
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Configure Your Exam
          </Typography>
          <Divider sx={{ mb: 3 }} />

          {/* Subject selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Subject</InputLabel>
            <Select
              value={subject}
              label="Subject"
              onChange={(e) => {
                setSubject(e.target.value);
                setQuestionCount(10);
              }}
            >
              {subjects.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Available question info */}
          <Alert severity="info" icon={<QuizIcon />} sx={{ mb: 3 }}>
            <strong>{maxCount}</strong> question{maxCount !== 1 ? 's' : ''} available for{' '}
            <strong>{subject}</strong>
          </Alert>

          {/* Question count */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                Number of Questions
              </Typography>
              <Chip label={adjustedCount} color="primary" size="small" />
            </Box>
            <Slider
              value={adjustedCount}
              min={1}
              max={maxCount}
              step={1}
              onChange={(_, val) => setQuestionCount(val as number)}
              marks={maxCount <= 20}
              disabled={maxCount === 0}
              sx={{ mt: 1 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">
                1
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {maxCount}
              </Typography>
            </Box>
          </Box>

          {/* Duration */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimerIcon fontSize="small" color="primary" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Duration (minutes)
                </Typography>
              </Box>
              <Chip label={`${duration} min`} color="secondary" size="small" />
            </Box>
            <Slider
              value={duration}
              min={5}
              max={60}
              step={5}
              onChange={(_, val) => setDuration(val as number)}
              marks={[
                { value: 5, label: '5m' },
                { value: 15, label: '15m' },
                { value: 30, label: '30m' },
                { value: 60, label: '60m' },
              ]}
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Summary */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              { label: 'Subject', value: subject },
              { label: 'Questions', value: adjustedCount },
              { label: 'Duration', value: `${duration} minutes` },
              { label: 'Per Question', value: `${Math.round((duration * 60) / adjustedCount)}s avg` },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 6 }}>
                <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1.5, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {item.label}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleStart}
            disabled={maxCount === 0}
            sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
          >
            Start Exam
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
