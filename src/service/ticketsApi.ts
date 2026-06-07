import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQueryWithReauth';

export const ticketsApi = createApi({
    reducerPath: 'ticketsApi',
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({
        createSupportTicket: builder.mutation<any, { user_id: string; subject: string; description: string; priority: string; category: string }>({
            query: data => ({
                url: '/support/tickets/user',
                method: 'POST',
                body: data,
            }),
        }),
        getTicketMessages: builder.query<any, string>({
            query: ticketId => ({
                url: `/support/tickets/user/${ticketId}/messages`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useCreateSupportTicketMutation,
    useLazyGetTicketMessagesQuery
} = ticketsApi;
