import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../services/api';

const TOKEN_LIFETIME_MS = 15 * 60 * 1000; // 15 minut
const WARNING_BEFORE_EXPIRY_MS = 30 * 1000; // 30 sekund przed wygaśnięciem
const CHECK_INTERVAL_MS = 1000; // Sprawdzaj co sekundę

interface UseSessionTimerResult {
  showWarning: boolean;
  secondsRemaining: number;
  refreshSession: () => Promise<void>;
  resetTimer: () => void;
}

export const useSessionTimer = (isAuthenticated: boolean): UseSessionTimerResult => {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const sessionStartRef = useRef<number>(Date.now());
  const timerRef = useRef<number | null>(null);

  const resetTimer = useCallback(() => {
    sessionStartRef.current = Date.now();
    setShowWarning(false);
    setSecondsRemaining(30);
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      const response = await api.post<{ token: string }>('/auth/refresh');
      
      // Zapisz nowy token
      localStorage.setItem('authToken', response.token);
      
      // Zresetuj timer
      resetTimer();
      
      console.log('Session refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh session:', error);
      // Jeśli refresh się nie udał, użytkownik zostanie wylogowany przez interceptor
      throw error;
    }
  }, [resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Wyczyść timer gdy użytkownik się wyloguje
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setShowWarning(false);
      return;
    }

    // Uruchom timer
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - sessionStartRef.current;
      const remaining = TOKEN_LIFETIME_MS - elapsed;

      // Jeśli zbliża się wygaśnięcie (ostatnie 30 sekund)
      if (remaining <= WARNING_BEFORE_EXPIRY_MS && remaining > 0) {
        const secondsLeft = Math.ceil(remaining / 1000);
        setSecondsRemaining(secondsLeft);
        setShowWarning(true);
      } else if (remaining <= 0) {
        // Token wygasł - wyloguj użytkownika
        setShowWarning(false);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      } else {
        setShowWarning(false);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated]);

  // Zresetuj timer po każdym logowaniu
  useEffect(() => {
    if (isAuthenticated) {
      resetTimer();
    }
  }, [isAuthenticated, resetTimer]);

  return {
    showWarning,
    secondsRemaining,
    refreshSession,
    resetTimer
  };
};
