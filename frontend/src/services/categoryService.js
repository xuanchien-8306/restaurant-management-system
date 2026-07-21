import axiosClient from '../api/axiosClient';

const categoryService = {
    getAllCategories: () => {
        return axiosClient.get('/categories');
    }
};

export default categoryService;