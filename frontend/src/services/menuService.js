import axiosClient from '../api/axiosClient';

const menuService = {
    getMenu: (params) => {
        return axiosClient.get('/menu', { params });
    },
    getMenuById: (id) => {
        return axiosClient.get(`/menu/${id}`);
    }
};

export default menuService;