import axiosClient from '../api/axiosClient';

const orderService = {
    createOrder: (data) => {
        return axiosClient.post('/orders', data);
    },
    getMyOrders: () => {
        return axiosClient.get('/orders/my');
    },
    getOrderById: (id) => {
        return axiosClient.get(`/orders/${id}`);
    }
};

export default orderService;