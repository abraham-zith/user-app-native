export type RootStackParamList = {
    Checkout: undefined;
    PaymentStatus: {
        status: 'success' | 'failed';
        paymentId?: string;
        amount?: number
    };
    FareSummary: {
        tripData: {
            total: number;
            distance: string;
            // add any other trip details you want to pass
        }
    };
};