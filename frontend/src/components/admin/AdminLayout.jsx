import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Dropdown, Space, theme, Modal, Avatar } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined, UserOutlined, TeamOutlined, AppstoreOutlined,
  CoffeeOutlined, InboxOutlined, FileTextOutlined, BorderOutlined,
  ShoppingCartOutlined, DesktopOutlined, FireOutlined, CalendarOutlined,
  GiftOutlined, BarChartOutlined, LogoutOutlined, MenuFoldOutlined,
  MenuUnfoldOutlined, IdcardOutlined, KeyOutlined, ExclamationCircleFilled
} from '@ant-design/icons';
import ChangePasswordModal from './ChangePasswordModal';
import profileApi from '../../api/profileApi';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { confirm } = Modal;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();

  // Load user info for Header and listen for Profile updates
  useEffect(() => {
    const loadUser = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUserInfo(JSON.parse(userStr));
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    return () => window.removeEventListener('storage', loadUser);
  }, []);

  const handleLogoutAction = async () => {
    try {
      await profileApi.logout();
    } catch (e) {
      console.log('Logout API fail ignored');
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const showLogoutConfirm = () => {
    confirm({
      title: 'Xác nhận Đăng xuất',
      icon: <ExclamationCircleFilled />,
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      okText: 'Đăng xuất',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() { handleLogoutAction(); },
    });
  };

  const handleMenuClick = ({ key }) => {
    if (key === 'profile') navigate('/admin/profile');
    else if (key === 'password') setIsPasswordModalOpen(true);
    else if (key === 'logout') showLogoutConfirm();
  };

  const userMenu = {
    items: [
      { key: 'profile', icon: <IdcardOutlined />, label: 'Thông tin cá nhân' },
      { key: 'password', icon: <KeyOutlined />, label: 'Đổi mật khẩu' },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true },
    ],
    onClick: handleMenuClick
  };

  const menuItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/orders', icon: <ShoppingCartOutlined />, label: 'Đơn hàng' },
    { key: '/admin/pos', icon: <DesktopOutlined />, label: 'Bán hàng (POS)' },
    { key: '/admin/kds', icon: <FireOutlined />, label: 'Bếp (KDS)' },
    { key: '/admin/bookings', icon: <CalendarOutlined />, label: 'Đặt bàn' },
    { key: '/admin/tables', icon: <BorderOutlined />, label: 'Phòng / Bàn' },
    { key: '/admin/menu', icon: <CoffeeOutlined />, label: 'Thực đơn' },
    { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Danh mục' },
    { key: '/admin/inventory', icon: <InboxOutlined />, label: 'Kho hàng' },
    { key: '/admin/recipes', icon: <FileTextOutlined />, label: 'Công thức' },
    { key: '/admin/promotions', icon: <GiftOutlined />, label: 'Khuyến mãi' },
    { key: '/admin/customers', icon: <UserOutlined />, label: 'Khách hàng' },
    { key: '/admin/staff', icon: <TeamOutlined />, label: 'Nhân viên' },
    { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Báo cáo & Thống kê' }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: '#001529' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.1)' }}>
          <Title level={4} style={{ color: 'white', margin: 0, overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {collapsed ? 'RMS' : 'RESTAURANT PRO'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ padding: '0 24px', background: token.colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} style={{ fontSize: '16px', width: 64, height: 64 }} />
          
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <Button type="text" style={{ height: '100%', padding: '0 12px' }}>
              <Space>
                <Avatar src={userInfo.avatar} icon={!userInfo.avatar && <UserOutlined />} />
                <Text strong>{userInfo.fullName || userInfo.username || 'Quản trị viên'}</Text>
              </Space>
            </Button>
          </Dropdown>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: token.colorBgContainer, borderRadius: token.borderRadiusLG, overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>

      <ChangePasswordModal 
        open={isPasswordModalOpen} 
        onCancel={() => setIsPasswordModalOpen(false)} 
        onSuccess={() => {
            setIsPasswordModalOpen(false);
            handleLogoutAction(); // Force logout after success
        }}
      />
    </Layout>
  );
};

export default AdminLayout;