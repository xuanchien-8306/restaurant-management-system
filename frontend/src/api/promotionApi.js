import axiosClient from './axiosClient';

const promotionApi = {
    getPromotions: (params) => axiosClient.get('/admin/promotions', { params }),
    createPromotion: (data) => axiosClient.post('/admin/promotions', data),
    updatePromotion: (id, data) => axiosClient.put(`/admin/promotions/${id}`, data),
    changeStatus: (id, status) => axiosClient.patch(`/admin/promotions/${id}/status`, null, { params: { status } }),
    deletePromotion: (id) => axiosClient.delete(`/admin/promotions/${id}`),
    validatePromotion: (data) => axiosClient.post('/admin/promotions/validate', data)
};

export default promotionApi;