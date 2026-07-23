import axiosClient from './axiosClient';

const posApi = {
    getActiveOrder: (tableId) => axiosClient.get(`/admin/pos/tables/${tableId}/order`),
    addItem: (tableId, data) => axiosClient.post(`/admin/pos/tables/${tableId}/items`, data),
    updateItem: (orderId, itemId, data) => axiosClient.put(`/admin/pos/orders/${orderId}/items/${itemId}`, data),
    removeItem: (orderId, itemId) => axiosClient.delete(`/admin/pos/orders/${orderId}/items/${itemId}`),
    sendToKitchen: (orderId) => axiosClient.post(`/admin/pos/orders/${orderId}/kitchen`),
    payOrder: (orderId, data) => axiosClient.post(`/admin/pos/orders/${orderId}/pay`, data),
};

export default posApi;