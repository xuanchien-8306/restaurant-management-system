import axiosClient from './axiosClient';

const menuAdminApi = {
    getMenuItems: (params) => {
        return axiosClient.get('/admin/menu', { params });
    },
    getCategories: () => {
        return axiosClient.get('/admin/menu/categories');
    },
    createMenuItem: (data) => {
        return axiosClient.post('/admin/menu', data);
    },
    updateMenuItem: (id, data) => {
        return axiosClient.put(`/admin/menu/${id}`, data);
    },
    toggleStatus: (id) => {
        return axiosClient.patch(`/admin/menu/${id}/toggle-status`);
    },
    deleteMenuItem: (id) => {
        return axiosClient.delete(`/admin/menu/${id}`);
    }
};

export default menuAdminApi;