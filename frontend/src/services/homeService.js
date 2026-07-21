import axiosClient from '../api/axiosClient';

const homeService = {
    getBanners: () => axiosClient.get('/home/banners'),
    getPromotions: () => axiosClient.get('/home/promotions')
};

export default homeService;