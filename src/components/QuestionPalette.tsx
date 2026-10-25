import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import BookmarkIcon from '@mui/icons-material/Bookmark';

interface QuestionPaletteProps {
  total: number;
  currentIndex: number;
  answers: Record<string, string>;
  markedForReview: string[];
  questionIds: string[];
  onJump: (index: number) => void;
}

export default function QuestionPalette({
  total,
  currentIndex,
  answers,
  markedForReview,
  questionIds,
  onJump,
}: QuestionPaletteProps) {
  const getStatus = (index: number) => {
    const id = questionIds[index];
    if (index === currentIndex) return 'current';
    if (markedForReview.includes(id) && answers[id]) return 'answered-review';
    if (markedForReview.includes(id)) return 'review';
    if (answers[id]) return 'answered';
    return 'unanswered';
  };

  const statusColors: Record<string, { bg: string; color: string; border?: string }> = {
    current: { bg: 'primary.main', color: 'primary.contrastText' },
    answered: { bg: 'success.main', color: 'success.contrastText' },
    review: { bg: 'warning.main', color: 'warning.contrastText' },
    'answered-review': { bg: 'info.main', color: 'info.contrastText' },
    unanswered: { bg: 'grey.200', color: 'text.primary', border: '1px solid' },
  };

  const legend = [
    { label: 'Current', status: 'current' },
    { label: 'Answered', status: 'answered' },
    { label: 'Unanswered', status: 'unanswered' },
    { label: 'Review', status: 'review' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        Question Palette
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={0.75} mb={2}>
        {legend.map((l) => {
          const s = statusColors[l.status];
          return (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: 0.5,
                  bgcolor: s.bg,
                  border: s.border,
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {l.label}
              </Typography>
            </Box>
          );
        })}
      </Stack>

      <Divider sx={{ mb: 1.5 }} />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {Array.from({ length: total }, (_, i) => {
          const status = getStatus(i);
          const s = statusColors[status];
          const isMarked = markedForReview.includes(questionIds[i]);
          return (
            <Tooltip key={i} title={`Question ${i + 1}`} placement="top">
              <Button
                onClick={() => onJump(i)}
                size="small"
                sx={{
                  minWidth: 36,
                  height: 36,
                  p: 0,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  bgcolor: s.bg,
                  color: s.color,
                  border: s.border ?? 'none',
                  borderColor: 'divider',
                  position: 'relative',
                  '&:hover': { opacity: 0.85, bgcolor: s.bg },
                }}
              >
                {i + 1}
                {isMarked && (
                  <BookmarkIcon
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      fontSize: 12,
                      color: 'warning.dark',
                    }}
                  />
                )}
              </Button>
            </Tooltip>
          );
        })}
      </Box>

      <Divider sx={{ mt: 2, mb: 1.5 }} />

      <Typography variant="caption" color="text.secondary" display="block">
        Answered: {Object.keys(answers).length} / {total}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        Unanswered: {total - Object.keys(answers).length}
      </Typography>
      {markedForReview.length > 0 && (
        <Typography variant="caption" color="warning.dark" display="block">
          Marked for review: {markedForReview.length}
        </Typography>
      )}
    </Box>
  );
}
