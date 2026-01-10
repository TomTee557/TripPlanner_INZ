import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import authReducer from '@store/slices/authSlice';
import tripsReducer from '@store/slices/tripsSlice';
import rootSaga from '@sagas';

// Create saga middleware
const sagaMiddleware = createSagaMiddleware();

// Configure store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    trips: tripsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk since we're using saga
      serializableCheck: false, // Disable serializable check for saga actions
    }).concat(sagaMiddleware),
});

// Run sagas
sagaMiddleware.run(rootSaga);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
