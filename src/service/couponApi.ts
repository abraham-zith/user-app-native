import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const couponApi = createApi({
  reducerPath: 'couponApi',
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getAvailableCoupons: builder.query<any, void>({
      query: () => ({
        url: '/coupons/available',
        method: 'GET',
      }),
    }),
    validateCoupon: builder.mutation<any, { code: string; rideAmount: number }>({
      query: data => ({
        url: '/coupons/validate',
        method: 'POST',
        body: data,
      }),
    }),
    subscribeToCouponTopic: builder.mutation<any, { userId: string; couponCode: string; fcmToken: string }>({
      query: data => ({
        url: '/notifications/subscribe-to-coupon',
        method: 'POST',
        body: data,
      }),
    }),
    unsubscribeCoupon: builder.mutation<any, { userId: string; couponCode: string; fcmToken: string }>({
      query: data => ({
        url: '/notifications/unsubscribe',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { 
  useGetAvailableCouponsQuery, 
  useValidateCouponMutation,
  useSubscribeToCouponTopicMutation,
  useUnsubscribeCouponMutation
} = couponApi;
