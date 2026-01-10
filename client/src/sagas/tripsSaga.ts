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
    const response: { success: boolean; trips: Trip[] } = yield call(
      api.get.bind(api),
      '/trips'
    );
    yield put(fetchTripsSuccess(response.trips || []));
  } catch (error: any) {
    const message = error.response?.data?.message || 'Failed to fetch trips';
    yield put(fetchTripsFailure(message));
  }
}

// Create trip saga
function* createTripSaga(action: PayloadAction<CreateTripData>) {
  try {
    const response: { success: boolean; trip: Trip } = yield call(
      api.post.bind(api),
      '/trips',
      action.payload
    );
    yield put(createTripSuccess(response.trip));
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
    const { id, ...data } = action.payload;
    const response: { success: boolean; trip: Trip } = yield call(
      api.put.bind(api),
      `/trips/${id}`,
      data
    );
    yield put(updateTripSuccess(response.trip));
  } catch (error: any) {
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
