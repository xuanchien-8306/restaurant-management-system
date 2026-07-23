import axiosClient from './axiosClient';

const kdsApi = {
    getActiveOrders: () => axiosClient.get('/admin/kds/orders'),
    updateItemStatus: (orderId, itemId, status) => axiosClient.patch(`/admin/kds/orders/${orderId}/items/${itemId}/status`, null, { params: { status } }),
    updateOrderStatus: (orderId, status) => axiosClient.patch(`/admin/kds/orders/${orderId}/status`, null, { params: { status } }),
};

export default kdsApi;  