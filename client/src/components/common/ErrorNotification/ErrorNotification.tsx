import { useEffect } from 'react';
import './ErrorNotification.scss';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const ErrorNotification = ({ 
  message, 
  onClose, 
  duration = 5000 
}: ErrorNotificationProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="error-notification">
      <div className="error-notification__content">
        <div className="error-notification__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2"/>
            <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="error-notification__text">
          <h4 className="error-notification__title">Error</h4>
          <p className="error-notification__message">{message}</p>
        </div>
        <button 
          className="error-notification__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};
