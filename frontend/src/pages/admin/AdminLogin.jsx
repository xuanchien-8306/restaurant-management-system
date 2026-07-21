import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import useAuthStore from '../../store/useAuthStore';
import './AdminLogin.css';

const { Title, Text } = Typography;

const AdminLogin = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const loginStore = useAuthStore(state => state.login);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const response = await authApi.login({
                username: values.username,
                password: values.password
            });
            
            if (response.success) {
                const { token, username, role } = response.data;
                
                if (role === 'CUSTOMER') {
                    message.error('Bạn không có quyền truy cập khu vực quản trị!');
                    return;
                }

                loginStore({ username, role }, token);
                message.success('Đăng nhập hệ thống quản trị thành công!');
                navigate('/admin/dashboard');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="admin-login-box">
                <div className="admin-login-header">
                    <Title level={2} style={{ color: '#fff', margin: 0 }}>RMS ADMIN</Title>
                    <Text style={{ color: '#aaa' }}>Restaurant Point of Sale & Management</Text>
                </div>
                
                <Form name="admin_login_form" onFinish={onFinish} size="large" className="admin-login-form">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                        <Input prefix={<UserOutlined style={{ color: '#888' }} />} placeholder="Tên đăng nhập" />
                    </Form.Item>
                    
                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined style={{ color: '#888' }} />} placeholder="Mật khẩu" />
                    </Form.Item>
                    
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox style={{ color: '#ccc' }}>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                    </Form.Item>
                    
                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" className="admin-btn-login" loading={loading} block>
                            ĐĂNG NHẬP HỆ THỐNG
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};

export default AdminLogin;