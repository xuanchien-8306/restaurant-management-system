import axiosClient from './axiosClient';

const customerAdminApi = {
    getCustomers: (params) => {
        return axiosClient.get('/admin/customers', { params });
    },
    createCustomer: (data) => {
        return axiosClient.post('/admin/customers', data);
    },
    updateCustomer: (id, data) => {
        return axiosClient.put(`/admin/customers/${id}`, data);
    },
    toggleStatus: (id) => {
        return axiosClient.patch(`/admin/customers/${id}/toggle-status`);
    },
    deleteCustomer: (id) => {
        return axiosClient.delete(`/admin/customers/${id}`);
    }
};

export default customerAdminApi;