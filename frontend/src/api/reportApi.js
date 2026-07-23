import axiosClient from './axiosClient';

const reportApi = {
    getKpi: (params) => axiosClient.get('/admin/reports/kpi', { params }),
    getRevenueChart: (params) => axiosClient.get('/admin/reports/charts/revenue', { params }),
    getPaymentMethods: (params) => axiosClient.get('/admin/reports/charts/payment-methods', { params }),
    getOrderStatus: (params) => axiosClient.get('/admin/reports/charts/order-status', { params }),
    getTopItems: (params) => axiosClient.get('/admin/reports/tables/top-items', { params }),
    getInventoryWarning: () => axiosClient.get('/admin/reports/tables/inventory-warning'),
    
    // Export URLs
    getExcelExportUrl: (start, end) => `http://localhost:8080/api/admin/reports/export/excel?start=${start}&end=${end}`,
    getPdfExportUrl: (start, end) => `http://localhost:8080/api/admin/reports/export/pdf?start=${start}&end=${end}`,
};

export default reportApi;