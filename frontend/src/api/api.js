import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token if needed
api.interceptors.request.use(
    (config) => {
        // You can add authentication tokens here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
    }
);

// Room APIs
export const searchRooms = (searchParams) => {
    return api.post('/rooms/available', searchParams);
};

export const checkAvailability = (roomId, checkIn, checkOut) => {
    return api.get(`/rooms/check-availability/${roomId}`, {
        params: { checkIn, checkOut }
    }).then(response => response.available);
};





// Booking APIs
export const createBooking = (bookingData) => {
    return api.post('/bookings/create', bookingData);
};

export const getCustomerBookings = (email) => {
    return api.get(`/bookings/customer/${email}`);
};

export const cancelBooking = (bookingId) => {
    return api.put(`/bookings/${bookingId}/cancel`);
};



export default api;