import { useEffect, useState } from 'react';
import './RefreshSessionDialog.scss';

interface RefreshSessionDialogProps {
  isOpen: boolean;
  secondsRemaining: number;
  onRefresh: () => void;
  onLogout: () => void;
}

export const RefreshSessionDialog = ({
  isOpen,
  secondsRemaining,
  onRefresh,
  onLogout
}: RefreshSessionDialogProps) => {
  const [countdown, setCountdown] = useState(secondsRemaining);

  useEffect(() => {
    setCountdown(secondsRemaining);
  }, [secondsRemaining]);

  useEffect(() => {
    if (!isOpen || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, countdown, onLogout]);

  if (!isOpen) return null;

  return (
    <div className="refresh-session-overlay" onClick={onLogout}>
      <div className="refresh-session-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="refresh-session-dialog__icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        
        <h2 className="refresh-session-dialog__title">Session Expiring</h2>
        
        <p className="refresh-session-dialog__message">
          Your session will expire in <strong>{countdown} seconds</strong> and you will be logged out.
        </p>
        
        <p className="refresh-session-dialog__submessage">
          Click the button to extend your session.
        </p>

        <div className="refresh-session-dialog__actions">
          <button 
            className="refresh-session-dialog__button refresh-session-dialog__button--secondary" 
            onClick={onLogout}
          >
            Logout Now
          </button>
          <button 
            className="refresh-session-dialog__button refresh-session-dialog__button--primary" 
            onClick={onRefresh}
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  );
};
