import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, LoginCredentials, RegisterData } from '@types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: sessionStorage.getItem('authError') || null,
  successMessage: sessionStorage.getItem('authSuccess') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginRequest: (state, _action: PayloadAction<LoginCredentials>) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
      sessionStorage.removeItem('authError');
      sessionStorage.removeItem('authSuccess');
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      
      // Save to localStorage
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      sessionStorage.setItem('authError', action.payload);
    },

    // Register actions
    registerRequest: (state, _action: PayloadAction<RegisterData>) => {
      state.loading = true;
      state.error = null;
      state.successMessage = null;
      sessionStorage.removeItem('authSuccess');
    },
    registerSuccess: (state, _action: PayloadAction<{ user: User; token: string }>) => {
      state.loading = false;
      state.error = null;
      state.successMessage = 'Registration successful! Please log in.';
      sessionStorage.setItem('authSuccess', 'Registration successful! Please log in.');
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      sessionStorage.setItem('authError', action.payload);
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
      sessionStorage.removeItem('authError');
      sessionStorage.removeItem('authSuccess');
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logout,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
