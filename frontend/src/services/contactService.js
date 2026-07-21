import axiosClient from '../api/axiosClient';

const contactService = {
    submitContact: (data) => {
        return axiosClient.post('/contact', data);
    }
};

export default contactService;