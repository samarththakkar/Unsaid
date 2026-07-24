import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    withCredentials: true, // Crucial for sending/receiving HTTP-only cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Optional: Add response interceptor for global error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // If backend sends an ApiResponse formatted error
        const message = error.response?.data?.message || 'An unexpected error occurred';
        return Promise.reject(new Error(message));
    }
);

export default api;
