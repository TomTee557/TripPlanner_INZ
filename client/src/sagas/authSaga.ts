import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
} from '@store/slices/authSlice';
import api from '@services/api';
import type { LoginCredentials, RegisterData, AuthResponse } from '@types';

// Login saga
function* loginSaga(action: PayloadAction<LoginCredentials>) {
  try {
    const response: AuthResponse = yield call(
      api.post.bind(api),
      '/auth/login',
      action.payload
    );
    
    yield put(loginSuccess({
      user: response.user,
      token: response.token,
    }));
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    yield put(loginFailure(message));
  }
}

// Register saga
function* registerSaga(action: PayloadAction<RegisterData>) {
  try {
    const response: AuthResponse = yield call(
      api.post.bind(api),
      '/auth/register',
      action.payload
    );
    
    yield put(registerSuccess({
      user: response.user,
      token: response.token,
    }));
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    yield put(registerFailure(message));
  }
}

// Auth saga watcher
export default function* authSaga() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(registerRequest.type, registerSaga);
}
