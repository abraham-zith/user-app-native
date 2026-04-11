import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';
import { Trip } from '../types/trip';

interface TripsApiResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: Trip[]; // This is the Array(13) you see in logs
    meta: {
        requestId: string;
        timestamp: string;
        service: string;
        version: string;
    };
    error: any;
}
interface TripApiResponse {
    statusCode: number;
    success: boolean;
    message: string;
    data: any; // This is the Array(13) you see in logs
    meta: {
        requestId: string;
        timestamp: string;
        service: string;
        version: string;
    };
    error: any;
}

export const tripApi = createApi({
    reducerPath: 'tripApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Trip'],
    endpoints: builder => ({
        //Trip
        createTrip: builder.mutation({
            query: data => ({
                url: '/trips/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),
        getAllTrips: builder.query<TripsApiResponse, void>({
            query: () => ({
                url: '/trips/all',
                method: 'GET',
            }),
            providesTags: ['Trip']
        }),
        getTrip: builder.query<TripsApiResponse, string>({
            query: (id) => ({
                url: `/trips/${id}`,
                method: "POST",
                body: {
                    role: "customer"
                }
            }),
            providesTags: ['Trip']
        }),
        getByTripId: builder.query<TripApiResponse, string>({
            query: (id) => ({
                url: `/trips/bytripid/${id}`,
                method: "GET",
            }),
            providesTags: ['Trip']
        }),
        getActiveTripbyUserId: builder.query<TripApiResponse, string>({
            query: (id) => ({
                url: `/trips/activetrip/${id}`,
                method: "GET",
            }),
            providesTags: ['Trip']
        }),
        updateTrip: builder.mutation({
            query: ({ trip_id, ...data }) => ({
                url: `/trips/update/${trip_id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),
        updateTripChanges: builder.mutation({
            query: data => ({
                url: '/trips/change/create',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),
        cancelTrip: builder.mutation({
            query: ({ trip_id, ...data }) => ({
                url: `/trips/cancel/${trip_id}`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),


        //SOS
        triggerSos: builder.mutation({
            query: data => ({
                url: '/sos/trigger',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),

    }),
});


export const {
    useCreateTripMutation,
    useGetAllTripsQuery,
    useGetTripQuery,
    useGetByTripIdQuery,
    useLazyGetByTripIdQuery,
    useGetActiveTripbyUserIdQuery,
    useLazyGetActiveTripbyUserIdQuery,
    useUpdateTripMutation,
    useUpdateTripChangesMutation,
    useCancelTripMutation,

    useTriggerSosMutation,
} = tripApi;


