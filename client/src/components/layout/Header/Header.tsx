import { useState, useEffect } from 'react';
import { getCurrentTime, getCurrentDateWithWeekday } from '@utils/helpers';
import './Header.scss';

interface HeaderProps {
  userName?: string;
  onLogout?: () => void;
}

export const Header = ({ userName, onLogout }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDateWithWeekday());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDateWithWeekday());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <div className="header__left">
        <img src="/logo.png" alt="Trip Planner" className="header__logo" />
        <div className="header__datetime">
          <div className="header__time">{currentTime}</div>
          <div className="header__date">{currentDate}</div>
        </div>
      </div>
      
      <div className="header__right">
        {userName && (
          <>
            <span className="header__username">Hello, {userName}</span>
            {onLogout && (
              <button className="header__logout" onClick={onLogout}>
                Logout
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
};
