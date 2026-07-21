import React, { useEffect, useState } from 'react';
import { Menu, Dropdown, Avatar, Layout, Badge, Modal } from 'antd';
import { UserOutlined, DownOutlined, LogoutOutlined, SettingOutlined, ShoppingOutlined, ShoppingCartOutlined, KeyOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import customerService from '../services/customerService';
import ProfileDrawer from './ProfileDrawer';
import ChangePasswordModal from './ChangePasswordModal';
import './Navbar.css';

const { Header } = Layout;
const { confirm } = Modal;

const Navbar = () => {
    const { logout } = useAuthStore();
    const { getTotalQuantity, clearCart } = useCartStore();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [profile, setProfile] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);

    useEffect(() => {
        // Chỉ gọi lấy profile nếu ở các route cần thiết để tối ưu
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await customerService.getProfile();
            if (res.success) {
                setProfile(res.data);
            }
        } catch (error) {
            console.error("Failed to load profile", error);
        }
    };

    const showLogoutConfirm = () => {
        confirm({
            title: 'Bạn có chắc chắn muốn đăng xuất?',
            content: 'Nếu đăng xuất bạn sẽ cần đăng nhập lại.',
            okText: 'Đăng xuất',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                clearCart();
                logout();
                navigate('/login');
            }
        });
    };

    const getSelectedKey = () => {
        const path = location.pathname;
        if (path.includes('/menu')) return 'menu';
        if (path.includes('/booking')) return 'booking';
        if (path.includes('/orders')) return 'orders';
        if (path.includes('/contact')) return 'contact';
        return 'home';
    };

    // Chuẩn mới của Ant Design v5: Dùng mảng items thay cho Menu.Item
    const navItems = [
        { key: 'home', label: <Link to="/">Trang chủ</Link> },
        { key: 'menu', label: <Link to="/menu">Thực đơn</Link> },
        { key: 'booking', label: <Link to="/booking">Đặt bàn</Link> },
        { key: 'orders', label: <Link to="/orders">Đơn hàng</Link> },
        { key: 'contact', label: <Link to="/contact">Liên hệ</Link> }
    ];

    const userMenuProps = {
        items: [
            { key: '1', icon: <SettingOutlined />, label: 'Thông tin cá nhân', onClick: () => setIsProfileOpen(true) },
            { key: '2', icon: <ShoppingOutlined />, label: 'Đơn hàng của tôi', onClick: () => navigate('/orders') },
            { key: '3', icon: <EnvironmentOutlined />, label: 'Địa chỉ của tôi', onClick: () => setIsProfileOpen(true) },
            { type: 'divider' },
            { key: '4', icon: <KeyOutlined />, label: 'Đổi mật khẩu', onClick: () => setIsPasswordOpen(true) },
            { type: 'divider' },
            { key: '5', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: showLogoutConfirm }
        ]
    };

    return (
        <>
            <Header className="navbar-container">
                <div className="navbar-logo">
                    <Link to="/">RMS Restaurant</Link>
                </div>
                
                <Menu mode="horizontal" className="navbar-menu" selectedKeys={[getSelectedKey()]} items={navItems} />

                <div className="navbar-actions">
                    <div className="cart-icon" onClick={() => navigate('/cart')} style={{ marginRight: '24px', cursor: 'pointer', fontSize: '20px' }}>
                        <Badge count={getTotalQuantity()} color="#8b0000">
                            <ShoppingCartOutlined style={{ fontSize: '24px' }} />
                        </Badge>
                    </div>
                    <div className="navbar-user">
                        <Dropdown menu={userMenuProps} placement="bottomRight" trigger={['hover', 'click']}>
                            <div className="user-dropdown-btn">
                                <Avatar icon={<UserOutlined />} src={profile?.avatar} />
                                <span className="user-name">{profile?.fullName || 'Khách'}</span>
                                <DownOutlined style={{ fontSize: '12px', color: '#666' }} />
                            </div>
                        </Dropdown>
                    </div>
                </div>
            </Header>

            <ProfileDrawer 
                open={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                profile={profile}
                setProfile={setProfile}
            />

            <ChangePasswordModal 
                open={isPasswordOpen} 
                onClose={() => setIsPasswordOpen(false)} 
            />
        </>
    );
};

export default Navbar;