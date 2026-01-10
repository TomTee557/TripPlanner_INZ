import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Trip, CreateTripData, UpdateTripData } from '@types';

interface TripsState {
  trips: Trip[];
  selectedTrip: Trip | null;
  loading: boolean;
  error: string | null;
}

const initialState: TripsState = {
  trips: [],
  selectedTrip: null,
  loading: false,
  error: null,
};

const tripsSlice = createSlice({
  name: 'trips',
  initialState,
  reducers: {
    // Fetch trips
    fetchTripsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTripsSuccess: (state, action: PayloadAction<Trip[]>) => {
      state.loading = false;
      state.trips = action.payload;
      state.error = null;
    },
    fetchTripsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Create trip
    createTripRequest: (state, _action: PayloadAction<CreateTripData>) => {
      state.loading = true;
      state.error = null;
    },
    createTripSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false;
      state.trips.unshift(action.payload); // Add to beginning
      state.error = null;
    },
    createTripFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Update trip
    updateTripRequest: (state, _action: PayloadAction<UpdateTripData>) => {
      state.loading = true;
      state.error = null;
    },
    updateTripSuccess: (state, action: PayloadAction<Trip>) => {
      state.loading = false;
      const index = state.trips.findIndex(trip => trip.id === action.payload.id);
      if (index !== -1) {
        state.trips[index] = action.payload;
      }
      if (state.selectedTrip?.id === action.payload.id) {
        state.selectedTrip = action.payload;
      }
      state.error = null;
    },
    updateTripFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Delete trip
    deleteTripRequest: (state, _action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteTripSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.trips = state.trips.filter(trip => trip.id !== action.payload);
      if (state.selectedTrip?.id === action.payload) {
        state.selectedTrip = null;
      }
      state.error = null;
    },
    deleteTripFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Select trip for viewing/editing
    selectTrip: (state, action: PayloadAction<Trip | null>) => {
      state.selectedTrip = action.payload;
    },

    // Clear errors
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
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
  selectTrip,
  clearError,
} = tripsSlice.actions;

export default tripsSlice.reducer;
