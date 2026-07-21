import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Modal } from 'antd';
import { 
    DashboardOutlined, TeamOutlined, UserOutlined, FileTextOutlined, 
    AppstoreOutlined, DatabaseOutlined, ExperimentOutlined, TableOutlined,
    ShoppingCartOutlined, DesktopOutlined, FireOutlined, CalendarOutlined,
    GiftOutlined, LineChartOutlined, SettingOutlined, LogoutOutlined, KeyOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;
const { confirm } = Modal;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        confirm({
            title: 'Đăng xuất khỏi hệ thống?',
            okText: 'Đăng xuất',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                Modal.destroyAll(); 
                logout();
                navigate('/login');
            }
        });
    };

    const sidebarItems = [
        { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
        { key: '/admin/staff', icon: <TeamOutlined />, label: 'Nhân viên' },
        { key: '/admin/customers', icon: <UserOutlined />, label: 'Khách hàng' },
        { key: '/admin/menu', icon: <FileTextOutlined />, label: 'Thực đơn' },
        { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
        { key: '/admin/inventory', icon: <DatabaseOutlined />, label: 'Kho hàng' },
        { key: '/admin/recipes', icon: <ExperimentOutlined />, label: 'Công thức' },
        { key: '/admin/tables', icon: <TableOutlined />, label: 'Quản lý bàn' },
        { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
        { key: '/admin/pos', icon: <DesktopOutlined />, label: 'POS' },
        { key: '/admin/kds', icon: <FireOutlined />, label: 'KDS (Bếp)' },
        { key: '/admin/bookings', icon: <CalendarOutlined />, label: 'Đặt bàn' },
        { key: '/admin/promotions', icon: <GiftOutlined />, label: 'Khuyến mãi' },
        { key: '/admin/reports', icon: <LineChartOutlined />, label: 'Báo cáo & Thống kê' },
        { key: '/admin/settings', icon: <SettingOutlined />, label: 'Cài đặt' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout }
    ];

    const headerMenu = {
        items: [
            { key: '1', icon: <UserOutlined />, label: 'Thông tin cá nhân' },
            { key: '2', icon: <KeyOutlined />, label: 'Đổi mật khẩu' },
            { type: 'divider' },
            { key: '3', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout }
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh' }} className="admin-layout">
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} theme="dark" width={240}>
                <div className="admin-sidebar-logo">
                    {collapsed ? 'RMS' : 'RMS ADMIN'}
                </div>
                <Menu 
                    theme="dark" 
                    mode="inline" 
                    selectedKeys={[location.pathname]} 
                    items={sidebarItems}
                    onClick={({ key }) => {
                        if (key !== 'logout') navigate(key);
                    }}
                />
            </Sider>
            <Layout>
                <Header className="admin-header">
                    <div className="header-title">Hệ Thống Quản Trị</div>
                    <div className="header-user">
                        <Dropdown menu={headerMenu} placement="bottomRight">
                            <div className="admin-user-dropdown">
                                <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#d32f2f' }} />
                                <div className="admin-user-info">
                                    <Text strong className="admin-name">{user?.username}</Text>
                                    <Text type="secondary" className="admin-role">{user?.role}</Text>
                                </div>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="admin-content">
                    <div className="admin-content-inner">
                        <Outlet />
                    </div>
                </Content>
                <Layout.Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '10px 50px' }}>
                    RMS Restaurant Admin Panel ©{new Date().getFullYear()}
                </Layout.Footer>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;