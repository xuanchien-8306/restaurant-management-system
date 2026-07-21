import { create } from 'zustand';

const useAuthStore = create((set) => ({
    user: localStorage.getItem('token') ? {
        username: localStorage.getItem('username'),
        role: localStorage.getItem('role')
    } : null,
    token: localStorage.getItem('token') || null,
    
    login: (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('username', userData.username);
        localStorage.setItem('role', userData.role);
        set({ user: userData, token });
    },
    
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;