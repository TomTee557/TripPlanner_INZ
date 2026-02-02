import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  fetchTripsRequest,
  fetchTripsSuccess,
  fetchTripsFailure,
  createTripRequest,
  createTripSuccess,
  createTripFailure,
  updateTripRequest,
  updateTripSuccess,
  updateTripFailure,
  deleteTripRequest,
  deleteTripSuccess,
  deleteTripFailure,
} from '@store/slices/tripsSlice';
import api from '@services/api';
import type { Trip, CreateTripData, UpdateTripData } from '@types';

// Fetch trips saga
function* fetchTripsSaga() {
  try {
    const response: { success: boolean; data: Trip[] } = yield call(
      api.get.bind(api),
      '/trips'
    );
    yield put(fetchTripsSuccess(response.data || []));
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch trips';
    yield put(fetchTripsFailure(message));
  }
}

// Create trip saga
function* createTripSaga(action: PayloadAction<CreateTripData>) {
  try {
    const response: { success: boolean; data: Trip } = yield call(
      api.post.bind(api),
      '/trips',
      action.payload
    );
    yield put(createTripSuccess(response.data));
    // Re-fetch trips to get updated list
    yield put(fetchTripsRequest());
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to create trip';
    yield put(createTripFailure(message));
  }
}

// Update trip saga
function* updateTripSaga(action: PayloadAction<UpdateTripData>) {
  try {
    console.log('updateTripSaga: Called with payload:', action.payload);
    const { id, ...data } = action.payload;
    console.log('updateTripSaga: Trip ID:', id);
    console.log('updateTripSaga: Data to send:', data);
    const response: any = (yield call(
      api.put.bind(api),
      `/trips/${id}`,
      data
    )) as never;
    console.log('updateTripSaga: Response:', response);
    // api.put already unwraps response.data, so response.data is the trip object
    yield put(updateTripSuccess(response.data || response));
    // Refresh trips list
    yield put(fetchTripsRequest());
  } catch (error: any) {
    console.error('updateTripSaga: Error:', error);
    const message = error.response?.data?.message || 'Failed to update trip';
    yield put(updateTripFailure(message));
  }
}

// Delete trip saga
function* deleteTripSaga(action: PayloadAction<string>) {
  try {
    yield call(api.delete.bind(api), `/trips/${action.payload}`);
    yield put(deleteTripSuccess(action.payload));
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to delete trip';
    yield put(deleteTripFailure(message));
  }
}

// Trips saga watcher
export default function* tripsSaga() {
  yield takeLatest(fetchTripsRequest.type, fetchTripsSaga);
  yield takeLatest(createTripRequest.type, createTripSaga);
  yield takeLatest(updateTripRequest.type, updateTripSaga);
  yield takeLatest(deleteTripRequest.type, deleteTripSaga);
}
