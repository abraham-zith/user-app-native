import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const referralApi = createApi({
    reducerPath: 'referralApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        preValidateReferralCode: builder.mutation<{ success: boolean; data?: any; error?: string }, { code: string }>({
            query: (body) => ({
                url: '/referrals/pre-validate',
                method: 'POST',
                body,
            }),
        }),
        getReferralStats: builder.query<{ success: boolean; data: any }, void>({
            query: () => ({
                url: '/referrals/stats',
                method: 'GET',
            }),
        }),
        getReferralCode: builder.query<{ success: boolean; data: { referralCode: string | null } }, void>({
            query: () => ({
                url: '/referrals/code',
                method: 'GET',
            }),
        }),

        generateReferralCode: builder.mutation<{ success: boolean; data?: any; error?: string }, void>({
            query: () => ({
                url: '/referrals/generate',
                method: 'POST',
            }),
        }),

        applyReferralDiscount: builder.mutation<{ success: boolean; data: any; error?: string }, { minRideAmount?: number; tripId?: string }>({
            query: (body) => ({
                url: '/referrals/apply-discount',
                method: 'POST',
                body,
            }),
        }),

        checkReferralEligibility: builder.query<{ success: boolean; data: { isReferred: boolean; isEligible: boolean } }, void>({
            query: () => ({
                url: '/referrals/check-eligibility',
                method: 'GET',
            }),
        }),

    }),
});

export const {
    usePreValidateReferralCodeMutation,
    useGetReferralStatsQuery,
    useGetReferralCodeQuery,
    useGenerateReferralCodeMutation,
    useApplyReferralDiscountMutation,
    useCheckReferralEligibilityQuery,
} = referralApi;
