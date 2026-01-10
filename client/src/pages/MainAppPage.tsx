import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTripsRequest } from '@store/slices/tripsSlice';
import { logout } from '@store/slices/authSlice';
import type { RootState } from '@store';
import type { Trip } from '@types';
import '@styles/mainApp.scss';

const MainAppPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { trips, loading } = useSelector((state: RootState) => state.trips);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      // Fetch trips on mount
      dispatch(fetchTripsRequest());
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="main-app">
      <div className="main-app__search-panel">
        <img src="/src/assets/logo.png" alt="Trip Planner Logo" className="main-app__logo" />
        <h2>Welcome, {user?.name}!</h2>
        <button onClick={handleLogout} className="main-app__button">
          Logout
        </button>
      </div>

      <div className="main-app__content">
        <h1>Your Trips</h1>
        
        {loading && <p>Loading trips...</p>}
        
        {!loading && trips.length === 0 && (
          <p>No trips yet. Create your first trip!</p>
        )}
        
        {!loading && trips.length > 0 && (
          <div className="trips-grid">
            {trips.map((trip: Trip) => (
              <div key={trip.id} className="trip-card">
                <h3>{trip.title}</h3>
                <p>{trip.country}</p>
                <p>{trip.dateFrom} - {trip.dateTo}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainAppPage;
