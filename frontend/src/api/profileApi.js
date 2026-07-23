import axiosClient from './axiosClient';

const profileApi = {
    getProfile: () => axiosClient.get('/admin/profile'),
    updateProfile: (data) => axiosClient.put('/admin/profile', data),
    changePassword: (data) => axiosClient.post('/admin/profile/change-password', data),
    logout: () => axiosClient.post('/admin/profile/logout'),
};

export default profileApi;