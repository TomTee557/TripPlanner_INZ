import { useState, useEffect } from 'react';
import { getCurrentTime, getCurrentDateWithWeekday } from '@utils/helpers';

interface HeaderProps {
  isMobile?: boolean;
}

export const Header = ({ isMobile = false }: HeaderProps) => {
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
    <div className={`main-app__clock ${isMobile ? 'main-app__clock--mobile' : ''}`}>
      <div className="main-app__time" id={isMobile ? 'currentTimeMobile' : 'currentTime'}>{currentTime}</div>
      <div className="main-app__date" id={isMobile ? 'currentDateMobile' : 'currentDate'}>{currentDate}</div>
    </div>
  );
};
