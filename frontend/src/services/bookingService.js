import axiosClient from '../api/axiosClient';

const bookingService = {
    createBooking: (data) => {
        return axiosClient.post('/bookings', data);
    },
    getMyBookings: () => {
        return axiosClient.get('/bookings/my');
    }
};

export default bookingService;