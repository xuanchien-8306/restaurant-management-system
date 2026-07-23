import axiosClient from './axiosClient';

const orderApi = {
    getOrders: (params) => axiosClient.get('/admin/orders', { params }),
    getOrderById: (id) => axiosClient.get(`/admin/orders/${id}`),
    getDependencies: () => axiosClient.get('/admin/orders/dependencies'),
    createOrder: (data) => axiosClient.post('/admin/orders', data),
    updateOrder: (id, data) => axiosClient.put(`/admin/orders/${id}`, data),
    changeStatus: (id, status) => axiosClient.patch(`/admin/orders/${id}/status`, null, { params: { status } }),
    cancelOrder: (id) => axiosClient.post(`/admin/orders/${id}/cancel`),
    getMyOrders: () => axiosClient.get('/orders/my')
};

export default orderApi;