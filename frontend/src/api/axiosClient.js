import axios from 'axios';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

axiosClient.interceptors.response.use((response) => {
    return response.data;
}, (error) => {
    const status = error.response ? error.response.status : null;
    
    // CHỈ LOGOUT KHI LỖI 401 (Hết hạn token)
    if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    } 
    // KHÔNG LOGOUT KHI LỖI 403, CHỈ BÁO LỖI
    else if (status === 403) {
        console.error("403 Forbidden: Không đủ quyền truy cập.");
        // Không xóa token, không dùng window.location.href
    }
    return Promise.reject(error);
});

export default axiosClient;