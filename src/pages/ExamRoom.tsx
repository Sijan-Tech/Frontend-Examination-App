import React, { useState, useEffect, useCallback, useRef } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from '@mui/icons-material/Close';
import Timer from '../components/Timer';
import QuestionPalette from '../components/QuestionPalette';
import Modal from '../components/Modal';
import { getCurrentExam, saveAttempt, clearCurrentExam, generateId } from '../utils/storage';
import type { CurrentExam } from '../utils/storage';

interface ExamRoomProps {
  onFinish: () => void;
}

export default function ExamRoom({ onFinish }: ExamRoomProps) {
  const exam = useRef<CurrentExam | null>(getCurrentExam());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitModal, setSubmitModal] = useState(false);
  const [timerRunning, setTimerRunning] = useState(true);

  const e = exam.current;

  const submitExam = useCallback(
    (autoSubmit = false) => {
      if (!e) return;
      setTimerRunning(false);
      const timeTaken = Math.floor((Date.now() - e.startTime) / 1000);
      let score = 0;
      e.questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) score++;
      });
      const attempt = {
        id: generateId(),
        subject: e.subject,
        date: new Date().toISOString(),
        score,
        total: e.questions.length,
        percentage: (score / e.questions.length) * 100,
        timeTaken,
        answers,
        markedForReview,
        questions: e.questions,
      };
      saveAttempt(attempt);
      clearCurrentExam();
      if (autoSubmit) {
        // slight delay so the timer state updates
        setTimeout(onFinish, 500);
      } else {
        onFinish();
      }
    },
    [e, answers, markedForReview, onFinish],
  );

  useEffect(() => {
    if (!e) onFinish();
  }, [e, onFinish]);

  if (!e) return null;

  const questions = e.questions;
  const currentQ = questions[currentIndex];
  const questionIds = questions.map((q) => q.id);
  const totalSeconds = e.duration * 60;
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQ.id]: value }));
  };

  const toggleReview = () => {
    setMarkedForReview((prev) =>
      prev.includes(currentQ.id) ? prev.filter((id) => id !== currentQ.id) : [...prev, currentQ.id],
    );
  };

  const isMarked = markedForReview.includes(currentQ.id);
  const unansweredCount = questions.length - answeredCount;

  return (
    <Box sx={{ pb: 4 }}>
      {/* Exam header bar */}
      <Paper
        elevation={3}
        square
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} sx={{ mr: 1 }}>
          {e.subject}
        </Typography>
        <Chip
          label={`Q ${currentIndex + 1} / ${questions.length}`}
          size="small"
          color="primary"
          variant="outlined"
        />
        <Box sx={{ flexGrow: 1 }} />
        <Timer totalSeconds={totalSeconds} onExpire={() => submitExam(true)} running={timerRunning} />
        <Tooltip title="Question Palette">
          <IconButton color="primary" onClick={() => setPaletteOpen(true)}>
            <GridViewIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={() => setSubmitModal(true)}
          sx={{ fontWeight: 700 }}
        >
          Submit
        </Button>
      </Paper>

      {/* Progress bar */}
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 4, bgcolor: 'grey.200' }}
        color={progress === 100 ? 'success' : 'primary'}
      />

      <Container maxWidth="md" sx={{ pt: 4 }}>
        {/* Question card */}
        <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3 }}>
          {/* Question header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`Question ${currentIndex + 1}`} color="primary" size="small" />
              <Chip label={e.subject} variant="outlined" size="small" />
              {answers[currentQ.id] && <Chip label="Answered" color="success" size="small" />}
              {isMarked && <Chip label="Marked for Review" color="warning" size="small" icon={<BookmarkIcon />} />}
            </Box>
            <Tooltip title={isMarked ? 'Remove from review' : 'Mark for review'}>
              <IconButton onClick={toggleReview} color={isMarked ? 'warning' : 'default'} size="small">
                {isMarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Question text */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 4, lineHeight: 1.6 }}>
            {currentQ.question}
          </Typography>

          {/* Options */}
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={answers[currentQ.id] ?? ''}
              onChange={(e) => handleAnswer(e.target.value)}
            >
              {currentQ.options.map((option, i) => (
                <FormControlLabel
                  key={i}
                  value={option}
                  control={<Radio />}
                  label={<Typography variant="body1">{option}</Typography>}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: answers[currentQ.id] === option ? 'primary.main' : 'divider',
                    bgcolor: answers[currentQ.id] === option ? 'primary.50' : 'transparent',
                    mx: 0,
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <Divider sx={{ my: 3 }} />

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBeforeIcon />}
              onClick={() => setCurrentIndex((i) => i - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>

            <Button
              variant="outlined"
              color={isMarked ? 'warning' : 'inherit'}
              startIcon={isMarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={toggleReview}
              size="small"
            >
              {isMarked ? 'Marked' : 'Mark Review'}
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<NavigateNextIcon />}
                onClick={() => setCurrentIndex((i) => i + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="success"
                onClick={() => setSubmitModal(true)}
              >
                Finish
              </Button>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Palette Drawer */}
      <Drawer anchor="right" open={paletteOpen} onClose={() => setPaletteOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Navigator
            </Typography>
            <IconButton onClick={() => setPaletteOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          <QuestionPalette
            total={questions.length}
            currentIndex={currentIndex}
            answers={answers}
            markedForReview={markedForReview}
            questionIds={questionIds}
            onJump={(i) => { setCurrentIndex(i); setPaletteOpen(false); }}
          />
        </Box>
      </Drawer>

      {/* Submit modal */}
      <Modal
        open={submitModal}
        title="Submit Exam?"
        message={
          unansweredCount > 0
            ? `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}. Are you sure you want to submit?`
            : 'All questions answered. Submit now?'
        }
        confirmLabel="Submit"
        cancelLabel="Continue Exam"
        onConfirm={() => { setSubmitModal(false); submitExam(); }}
        onCancel={() => setSubmitModal(false)}
        severity={unansweredCount > 0 ? 'warning' : 'info'}
      />
    </Box>
  );
}
