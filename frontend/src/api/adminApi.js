import axiosClient from './axiosClient';

const adminApi = {
    getDashboardStats: () => {
        return axiosClient.get('/admin/dashboard/stats');
    }
};

export default adminApi;