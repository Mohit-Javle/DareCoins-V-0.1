import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth Services
export const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    login: async (userData) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    updateProfile: async (userData) => {
        let config = {};
        if (userData instanceof FormData) {
            config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };
        }
        const response = await api.put('/auth/profile', userData, config);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            // We don't necessarily update the token here unless it was refreshed, but good practice if backend re-issues it
        }
        return response.data;
    },
    updateHighlights: async (data) => {
        const response = await api.put('/auth/highlights', data);
        return response.data;
    }
};

// Wallet Services
export const walletService = {
    getBalance: async () => {
        const response = await api.get('/wallet');
        return response.data;
    },
    topUp: async (amount) => {
        const response = await api.post('/wallet/topup', { amount });
        return response.data;
    },
    transfer: async (recipientUsername, amount) => {
        const response = await api.post('/wallet/transfer', { recipientUsername, amount });
        return response.data;
    }
};

// Dare Services
export const dareService = {
    getAllDares: async (filters = {}) => {
        const response = await api.get('/dares', { params: filters });
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/dares/${id}`);
        return response.data;
    },
    createDare: async (dareData) => {
        const response = await api.post('/dares', dareData);
        return response.data;
    },
    joinDare: async (id) => {
        const response = await api.post(`/dares/${id}/join`);
        return response.data;
    },
    ignoreDare: async (id) => {
        const response = await api.post(`/dares/${id}/ignore`);
        return response.data;
    },
    submitProof: async (id, data) => {
        // Check if we need to send FormData (file upload)
        if (data.proof instanceof File) {
            const formData = new FormData();
            formData.append('proof', data.proof);
            if (data.description) formData.append('description', data.description);

            const response = await api.post(`/dares/${id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } else {
            // Standard JSON fallback
            const response = await api.post(`/dares/${id}/submit`, data);
            return response.data;
        }
    },
    verifyProof: async (id, data) => {
        const response = await api.post(`/dares/${id}/verify`, data);
        return response.data;
    }
};

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    updateUser: async (id, data) => {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },
    getAllDares: async () => {
        const response = await api.get('/admin/dares');
        return response.data;
    },
    deleteDare: async (id) => {
        const response = await api.delete(`/admin/dares/${id}`);
        return response.data;
    },
    getAllTruths: async () => {
        const response = await api.get('/admin/truths');
        return response.data;
    },
    deleteTruth: async (id) => {
        const response = await api.delete(`/admin/truths/${id}`);
        return response.data;
    },
    getAllTransactions: async () => {
        const response = await api.get('/admin/transactions');
        return response.data;
    },
    getAnalyticsData: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    }
};

// Content Services
export const contentService = {
    getFeed: async () => {
        const response = await api.get('/content/feed');
        return response.data;
    },
    getUserProfile: async (username) => {
        const response = await api.get(`/users/${username}`);
        return response.data;
    },
    getProofs: async () => {
        const response = await api.get('/content/proofs');
        return response.data;
    }
};

// User Services
export const userService = {
    getLeaderboard: async (category = 'coins') => {
        const response = await api.get('/users/leaderboard', { params: { category } });
        return response.data;
    }
};

// Notification Services
export const notificationService = {
    getNotifications: async () => {
        const response = await api.get('/notifications');
        return response.data;
    },
    markRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
    markAllRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    }
};

// Truth Services
export const truthService = {
    getAllTruths: async (filters = {}) => {
        const response = await api.get('/truths', { params: filters });
        return response.data;
    },
    createTruth: async (truthData) => {
        const response = await api.post('/truths', truthData);
        return response.data;
    },
    answerTruth: async (id, answerData) => {
        if (answerData.videoUrl instanceof File) {
            const formData = new FormData();
            formData.append('proof', answerData.videoUrl); // Using 'proof' to match multer config
            if (answerData.answer) formData.append('answer', answerData.answer);

            const response = await api.post(`/truths/${id}/answer`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } else {
            const response = await api.post(`/truths/${id}/answer`, answerData);
            return response.data;
        }
    },
    verifyTruth: async (id, data) => {
        const response = await api.post(`/truths/${id}/verify`, data);
        return response.data;
    }
};

export default api;
