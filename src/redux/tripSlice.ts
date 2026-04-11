import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Trip } from '../types/trip';

interface TripState {
    activeTrip: Trip | null; // Keeps track of the trip currently being viewed/tracked
    activeTrips: Trip[];     // Keeps track of all ongoing trips (for the List and Badge)
    scheduledTrips: any[];
    loading: boolean;
}

const initialState: TripState = {
    activeTrip: null,
    activeTrips: [],
    scheduledTrips: [],
    loading: false,
};

const tripSlice = createSlice({
    name: 'trip',
    initialState,
    reducers: {
        // Sets the "currently viewed" trip
        setActiveTrip: (state, action: PayloadAction<Trip>) => {
            state.activeTrip = action.payload;
        },

        // Updates the entire array (useful when fetching from API on app launch)
        setActiveTrips: (state, action: PayloadAction<Trip[]>) => {
            state.activeTrips = action.payload;
        },

        // Real-time update for a specific trip in the array (for Badge/List)
        updateTripInArray: (state, action: PayloadAction<Partial<Trip> & { trip_id: string }>) => {
            const index = state.activeTrips.findIndex(t => t.trip_id === action.payload.trip_id);
            if (index !== -1) {
                state.activeTrips[index] = { ...state.activeTrips[index], ...action.payload };

                // Also update the activeTrip if it's the same one
                if (state.activeTrip?.trip_id === action.payload.trip_id) {
                    state.activeTrip = { ...state.activeTrip, ...action.payload };
                }
            }
        },

        // Add a single new trip to the array (when booking completes)
        addTripToArray: (state, action: PayloadAction<Trip>) => {
            const exists = state.activeTrips.find(t => t.trip_id === action.payload.trip_id);
            if (!exists) {
                state.activeTrips.push(action.payload);
            }
        },

        // Remove trip (when completed or cancelled)
        removeTripFromArray: (state, action: PayloadAction<string>) => {
            state.activeTrips = state.activeTrips.filter(t => t.trip_id !== action.payload);
            if (state.activeTrip?.trip_id === action.payload) {
                state.activeTrip = null;
            }
        },

        updateTripStatus: (state, action: PayloadAction<Trip['trip_status']>) => {
            if (state.activeTrip) {
                state.activeTrip.trip_status = action.payload;
            }
        },

        clearActiveTrip: (state) => {
            state.activeTrip = null;
        },

        setTripLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },


        //-------Scheduled Trips
        setScheduledTrips: (state, action) => {
            state.scheduledTrips = action.payload;
        },
        // Call this when a driver accepts a specific scheduled ride
        updateScheduledTripStatus: (state, action) => {
            const index = state.scheduledTrips.findIndex(t => t.id === action.payload.id);
            if (index !== -1) {
                state.scheduledTrips[index] = action.payload;
            }
        },
        // Optional: Remove it from scheduled and move to active when the ride starts
        startScheduledTrip: (state, action) => {
            state.scheduledTrips = state.scheduledTrips.filter(t => t.id !== action.payload.id);
            state.activeTrips.push(action.payload);
        },

        setTrips: (state, action: PayloadAction<{ activeTrips: Trip[], scheduledTrips: any[] }>) => {
            state.activeTrips = action.payload.activeTrips;
            state.scheduledTrips = action.payload.scheduledTrips;
            
            // ✅ Keep activeTrip in sync if it belongs to the active set
            if (state.activeTrip) {
                const refreshed = action.payload.activeTrips.find(t => t.trip_id === state.activeTrip?.trip_id);
                if (refreshed) {
                    state.activeTrip = refreshed;
                } else {
                    // Trip no longer active
                    state.activeTrip = null;
                }
            } else if (action.payload.activeTrips.length > 0) {
                // Auto-set first active trip if none is selected
                state.activeTrip = action.payload.activeTrips[0];
            }
        },
    },
});

export const {
    setActiveTrip,
    setActiveTrips,
    updateTripInArray,
    addTripToArray,
    removeTripFromArray,
    updateTripStatus,
    clearActiveTrip,
    setTripLoading,
    setScheduledTrips,
    updateScheduledTripStatus,
    startScheduledTrip,
    setTrips
} = tripSlice.actions;

export default tripSlice.reducer;