import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginRequest, registerRequest, clearError } from '@store/slices/authSlice';
import type { RootState } from '@store';
import '@styles/auth.scss';

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, successMessage, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    surname: '',
    nationality: '',
    dateOfBirth: '',
  });
  const [passwordError, setPasswordError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app');
    }
  }, [isAuthenticated, navigate]);

  // Switch to login after successful registration
  useEffect(() => {
    if (successMessage && !isLogin) {
      setIsLogin(true);
    }
  }, [successMessage, isLogin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    setPasswordError('');

    if (isLogin) {
      dispatch(loginRequest({
        email: formData.email,
        password: formData.password,
      }));
    } else {
      dispatch(registerRequest({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        surname: formData.surname,
        nationality: formData.nationality || undefined,
        birthday: formData.dateOfBirth || undefined,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="auth">
      <div className="auth__background"></div>
      <div className="auth__column">
        <div className="auth__container">
          <div className="auth__content">
            <img src="/logo.png" alt="Trip Planner Logo" className="auth__logo" />
            
            <form className="auth__form" onSubmit={handleSubmit}>
              <h2 className="auth__title">{isLogin ? 'Log in' : 'Register'}</h2>
              
              {!isLogin && (
                <>
                  <label htmlFor="name" className="auth__label">Name:</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="auth__input"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                  
                  <label htmlFor="surname" className="auth__label">Surname:</label>
                  <input
                    type="text"
                    id="surname"
                    name="surname"
                    className="auth__input"
                    value={formData.surname}
                    onChange={handleChange}
                    required={!isLogin}
                  />

                  <label htmlFor="nationality" className="auth__label">Nationality:</label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    className="auth__input"
                    placeholder="e.g. Polish, German, British"
                    value={formData.nationality}
                    onChange={handleChange}
                  />

                  <label htmlFor="dateOfBirth" className="auth__label">Date of birth:</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    className="auth__input"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </>
              )}
              
              <label htmlFor="email" className="auth__label">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="auth__input"
                value={formData.email}
                onChange={handleChange}
                required
              />
              
              <label htmlFor="password" className="auth__label">Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                className="auth__input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={!isLogin ? 6 : undefined}
              />
              {passwordError && (
                <p className="auth__message auth__message--error">{passwordError}</p>
              )}
              
              <button 
                type="submit" 
                className={`auth__button ${isLogin ? 'auth__button--login' : 'auth__button--register'}`}
                disabled={loading}
              >
                {loading ? 'Loading...' : (isLogin ? 'Log in' : 'Register')}
              </button>
              
              <p className="auth__switch">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <a href="#" onClick={(e) => { 
                  e.preventDefault(); 
                  dispatch(clearError());
                  setIsLogin(!isLogin); 
                }}>
                  {isLogin ? 'Register' : 'Log in'}
                </a>
              </p>
              
              {error && (
                <div className="auth__message auth__message--error">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="auth__message auth__message--success">
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
