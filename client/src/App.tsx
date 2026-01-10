import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@store';
import AuthPage from '@pages/AuthPage';
import MainAppPage from '@pages/MainAppPage';
import '@styles/global.scss';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/app" element={<MainAppPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
