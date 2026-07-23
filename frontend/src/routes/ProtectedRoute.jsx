import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ allowedRoles }) => {
    // Ưu tiên đọc trực tiếp từ LocalStorage để xử lý trễ của State
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    let user = null;
    
    try {
        // Zustand persist lưu cấu trúc lồng nhau { state: { user: {...}, token: ... } }
        const authStorage = JSON.parse(localStorage.getItem('auth-storage'));
        if (authStorage && authStorage.state) {
            user = authStorage.state.user;
        } else {
            // Hoặc đọc theo kiểu fallback truyền thống
            const userStr = localStorage.getItem('user');
            if (userStr) user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error("Lỗi đọc dữ liệu người dùng", e);
    }

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    let userRole = user.role;
    if (typeof user.role === 'object' && user.role !== null) {
        userRole = user.role.name; 
    }

    // Kiểm tra xem Role của user có nằm trong mảng allowedRoles không
    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        console.warn(`Chặn truy cập: Yêu cầu ${allowedRoles}, Hiện tại ${userRole}`);
        // Không xóa token, chỉ văng ra trang không có quyền (hoặc trang chủ)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;