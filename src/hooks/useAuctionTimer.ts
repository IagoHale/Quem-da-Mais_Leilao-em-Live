import { useEffect, useState } from 'react';
import { useToast } from '../components/feedback/ToastProvider';
import type { AuctionTimerState } from '../types/auction';

function formatTimerInput(minutes: number, seconds: number) {
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function parseTimerInput(input: string) {
  const sanitized = input.trim();
  if (!sanitized) return null;

  if (sanitized.includes(':')) {
    const [minutesPart, secondsPart, ...extraParts] = sanitized.split(':');
    if (extraParts.length > 0 || minutesPart === '' || secondsPart === '') return null;

    const minutes = Number(minutesPart);
    const seconds = Number(secondsPart);
    if (!Number.isInteger(minutes) || !Number.isInteger(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
      return null;
    }

    return {
      totalSeconds: minutes * 60 + seconds,
      normalized: formatTimerInput(minutes, seconds),
    };
  }

  const minutes = Number(sanitized);
  if (!Number.isInteger(minutes) || minutes < 0) return null;

  return {
    totalSeconds: minutes * 60,
    normalized: formatTimerInput(minutes, 0),
  };
}

export function useAuctionTimer() {
  const { showToast } = useToast();
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerInput, setTimerInput] = useState('05:00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const showInvalidTimerToast = () => {
    showToast({
      title: 'Tempo invalido',
      message: 'Use formatos como 10, 00:10 ou 10:30.',
      variant: 'error',
    });
  };

  const applyParsedInput = (options?: { startAfterApply?: boolean; forceReset?: boolean }) => {
    const parsed = parseTimerInput(timerInput);
    if (!parsed) {
      showInvalidTimerToast();
      return false;
    }

    setTimerInput(parsed.normalized);
    if (options?.forceReset || timerSeconds === 0) {
      setTimerSeconds(parsed.totalSeconds);
    }
    if (options?.startAfterApply) {
      setIsTimerRunning(true);
    }

    return true;
  };

  const handleStartTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    } else {
      applyParsedInput({ startAfterApply: true });
    }
  };

  const handleResetTimer = () => {
    applyParsedInput({ startAfterApply: true, forceReset: true });
  };

  const handleTimerInputChange = (value: string) => {
    const sanitized = value.replace(/[^\d:]/g, '');
    const colonCount = sanitized.split(':').length - 1;
    if (colonCount > 1) return;

    if (sanitized.includes(':')) {
      const [minutesPart, secondsPart = ''] = sanitized.split(':');
      setTimerInput(`${minutesPart.slice(0, 3)}:${secondsPart.slice(0, 2)}`);
      return;
    }

    setTimerInput(sanitized.slice(0, 3));
  };

  const handleTimerInputBlur = () => {
    const parsed = parseTimerInput(timerInput);
    if (parsed) {
      setTimerInput(parsed.normalized);
    }
  };

  const exportTimerState = (): AuctionTimerState => ({
    input: timerInput,
    seconds: timerSeconds,
  });

  const importTimerState = (timerState: AuctionTimerState) => {
    const parsed = parseTimerInput(timerState.input);
    setTimerInput(parsed?.normalized ?? '05:00');
    setTimerSeconds(Number.isFinite(timerState.seconds) && timerState.seconds >= 0 ? timerState.seconds : 0);
    setIsTimerRunning(false);
  };

  return {
    timerSeconds,
    isTimerRunning,
    timerInput,
    handleTimerInputChange,
    handleTimerInputBlur,
    handleStartTimer,
    handleResetTimer,
    exportTimerState,
    importTimerState,
  };
}
