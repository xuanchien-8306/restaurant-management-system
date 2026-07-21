import axiosClient from '../api/axiosClient';

const customerService = {
    getProfile: () => {
        return axiosClient.get('/customer/profile');
    },
    updateProfile: (data) => {
        return axiosClient.put('/customer/profile', data);
    },
    changePassword: (data) => {
        return axiosClient.put('/customer/password', data);
    }
};

export default customerService;