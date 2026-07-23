import axiosClient from './axiosClient';

const reservationApi = {
    getReservations: (params) => axiosClient.get('/admin/reservations', { params }),
    getAvailableTables: (params) => axiosClient.get('/admin/reservations/available-tables', { params }),
    createReservation: (data) => axiosClient.post('/admin/reservations', data),
    updateReservation: (id, data) => axiosClient.put(`/admin/reservations/${id}`, data),
    changeStatus: (id, status) => axiosClient.patch(`/admin/reservations/${id}/status`, null, { params: { status } }),
    checkIn: (id) => axiosClient.post(`/admin/reservations/${id}/check-in`)
};

export default reservationApi;