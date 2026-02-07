import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { store, type RootState } from '@store';
import AuthPage from '@pages/AuthPage';
import MainAppPage from '@pages/MainAppPage';
import { RefreshSessionDialog } from '@components/common/RefreshSessionDialog/RefreshSessionDialog';
import { useSessionTimer } from './hooks/useSessionTimer';
import '@styles/global.scss';

function AppContent() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { showWarning, secondsRemaining, refreshSession } = useSessionTimer(isAuthenticated);

  const handleRefresh = async () => {
    try {
      await refreshSession();
    } catch (error) {
      console.error('Failed to refresh session');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/auth';
  };

  return (
    <>
      <RefreshSessionDialog
        isOpen={showWarning}
        secondsRemaining={secondsRemaining}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/app" element={<MainAppPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
