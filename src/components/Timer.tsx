import React, { useEffect, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TimerIcon from '@mui/icons-material/Timer';
import { useTheme } from '@mui/material/styles';

interface TimerProps {
  totalSeconds: number;
  onExpire: () => void;
  running: boolean;
}

export default function Timer({ totalSeconds, onExpire, running }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const theme = useTheme();

  const handleExpire = useCallback(() => {
    onExpire();
  }, [onExpire]);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      handleExpire();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, running, handleExpire]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isWarning = remaining <= 60;
  const isCritical = remaining <= 30;

  const color = isCritical
    ? theme.palette.error.main
    : isWarning
    ? theme.palette.warning.main
    : theme.palette.success.main;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 2,
        py: 0.75,
        borderRadius: 2,
        bgcolor: isCritical ? 'error.light' : isWarning ? 'warning.light' : 'success.light',
        border: '1px solid',
        borderColor: color,
        transition: 'background-color 0.3s',
      }}
    >
      <TimerIcon sx={{ color, fontSize: 20 }} />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          minWidth: 64,
        }}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </Typography>
    </Box>
  );
}
