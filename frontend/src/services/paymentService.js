import api from './api';

export const paymentService = {
    // Create Razorpay Order
    createOrder: async (amount, packId) => {
        try {
            const response = await api.post('/payment/create-order', { amount, packId });
            return response.data;
        } catch (error) {
            console.error("Create Order Error:", error);
            throw error;
        }
    },

    // Verify Payment Signature
    verifyPayment: async (data) => {
        try {
            const response = await api.post('/payment/verify-payment', data);
            return response.data;
        } catch (error) {
            console.error("Verify Payment Error:", error);
            throw error;
        }
    },

    // Mock Payment (Bypass Razorpay)
    mockPayment: async (amount, drcAmount, packId) => {
        try {
            const response = await api.post('/payment/mock-payment', { amount, drcAmount, packId });
            return response.data;
        } catch (error) {
            console.error("Mock Payment Error:", error);
            throw error;
        }
    }
};
