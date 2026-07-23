import axiosClient from './axiosClient';

const tableApi = {
    getTables: (params) => axiosClient.get('/admin/tables', { params }),
    getAllTables: () => axiosClient.get('/admin/tables/all'),
    getAreas: () => axiosClient.get('/admin/tables/areas'),
    createTable: (data) => axiosClient.post('/admin/tables', data),
    updateTable: (id, data) => axiosClient.put(`/admin/tables/${id}`, data),
    deleteTable: (id) => axiosClient.delete(`/admin/tables/${id}`),
    
    changeStatus: (id, status) => axiosClient.patch(`/admin/tables/${id}/status`, null, { params: { status } }),
    transferTable: (data) => axiosClient.post('/admin/tables/transfer', data),
    mergeTables: (data) => axiosClient.post('/admin/tables/merge', data),
    splitTable: (data) => axiosClient.post('/admin/tables/split', data)
};

export default tableApi;