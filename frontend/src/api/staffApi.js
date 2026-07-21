import axiosClient from './axiosClient';

const staffApi = {
    getStaffs: (params) => {
        return axiosClient.get('/admin/staffs', { params });
    },
    getStaffRoles: () => {
        return axiosClient.get('/admin/staffs/roles');
    },
    createStaff: (data) => {
        return axiosClient.post('/admin/staffs', data);
    },
    updateStaff: (id, data) => {
        return axiosClient.put(`/admin/staffs/${id}`, data);
    },
    toggleStatus: (id) => {
        return axiosClient.delete(`/admin/staffs/${id}`);
    }
};

export default staffApi;