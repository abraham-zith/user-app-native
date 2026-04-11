import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';


// ─── RTK Query Auth API ───────────────────────────────────────────────────────
export const authApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        requestOtp: builder.mutation({
            query: (body) => ({
                url: '/auth/request-otp',
                method: 'POST',
                body,
            }),
        }),
        verifyOtp: builder.mutation({
            query: (body) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body,
            }),
        }),
        signOut: builder.mutation({
            query: (body) => ({
                url: '/auth/signout',
                method: 'POST',
                body,
            }),
        }),
    }),
});

export const {
    useRequestOtpMutation,
    useVerifyOtpMutation,
    useSignOutMutation,
} = authApi;