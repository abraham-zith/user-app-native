import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';


// ─── RTK Query Auth API ───────────────────────────────────────────────────────
export const sosApi = createApi({
    reducerPath: 'sosApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Trip'],
    endpoints: (builder) => ({
        //SOS
        triggerSos: builder.mutation({
            query: data => ({
                url: '/sos/trigger',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),

        updatelocation: builder.mutation({
            query: data => ({
                url: '/sos/location',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),

        // Trusted Contacts management
        getTrustedContacts: builder.query({
            query: () => ({
                url: '/sos/contacts',
                method: 'GET',
                params: { user_type: 'customer' },
            }),
            providesTags: ['Trip']
        }),
        addTrustedContact: builder.mutation({
            query: data => ({
                url: '/sos/contacts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Trip']
        }),
        removeTrustedContact: builder.mutation({
            query: data => ({
                url: `/sos/contacts/${data.id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Trip']
        }),
    }),
});

export const {
    useTriggerSosMutation,
    useUpdatelocationMutation,
    useGetTrustedContactsQuery,
    useAddTrustedContactMutation,
    useRemoveTrustedContactMutation,
} = sosApi;