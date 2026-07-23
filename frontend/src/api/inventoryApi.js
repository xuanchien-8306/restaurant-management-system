import axiosClient from './axiosClient';

const inventoryApi = {
    getIngredients: (params) => axiosClient.get('/admin/inventory/ingredients', { params }),
    createIngredient: (data) => axiosClient.post('/admin/inventory/ingredients', data),
    updateIngredient: (id, data) => axiosClient.put(`/admin/inventory/ingredients/${id}`, data),
    deleteIngredient: (id) => axiosClient.delete(`/admin/inventory/ingredients/${id}`),
    
    processStock: (id, data) => axiosClient.post(`/admin/inventory/ingredients/${id}/stock`, data),
    getHistory: (id) => axiosClient.get(`/admin/inventory/ingredients/${id}/history`),

    getSuppliers: () => axiosClient.get('/admin/inventory/suppliers'),
    getCategories: () => axiosClient.get('/admin/inventory/categories')
};

export default inventoryApi;