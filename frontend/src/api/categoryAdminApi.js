import axiosClient from './axiosClient';

const categoryAdminApi = {
    getCategories: (params) => {
        return axiosClient.get('/admin/categories', { params });
    },
    createCategory: (data) => {
        return axiosClient.post('/admin/categories', data);
    },
    updateCategory: (id, data) => {
        return axiosClient.put(`/admin/categories/${id}`, data);
    },
    toggleStatus: (id) => {
        return axiosClient.patch(`/admin/categories/${id}/toggle-status`);
    },
    deleteCategory: (id) => {
        return axiosClient.delete(`/admin/categories/${id}`);
    }
};

export default categoryAdminApi;