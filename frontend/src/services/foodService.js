import axiosClient from '../api/axiosClient';

const foodService = {
    getAllFoods: () => {
        return axiosClient.get('/foods');
    },
    getFeaturedFoods: () => {
        return axiosClient.get('/foods/featured');
    },
    getFoodById: (id) => {
        return axiosClient.get(`/foods/${id}`);
    }
};

export default foodService;