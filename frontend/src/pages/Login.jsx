import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import authApi from '../api/authApi';
import useAuthStore from '../store/useAuthStore';
import './Auth.css';

const { Title } = Typography;

const Login = () => {
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
                
                // 1. Cập nhật state (Code cũ của bạn)
                loginStore({ username, role }, token); 
                
                // 2. LƯU VÀO LOCAL STORAGE (BẮT BUỘC ĐỂ KHÔNG BỊ VĂNG)
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify({ username, role }));
                
                message.success('Đăng nhập thành công!');
                
                // 3. Phân quyền chuyển hướng
                if (role === 'ADMIN' || role === 'STAFF' || role === 'MANAGER' || role === 'CASHIER' || role === 'WAITER' || role === 'KITCHEN') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Tài khoản hoặc mật khẩu không chính xác');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <Title level={2} className="auth-title">RMS Login</Title>
                <Form name="login_form" onFinish={onFinish} size="large">
                    <Form.Item name="username" rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
                    </Form.Item>
                    
                    <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
                    </Form.Item>
                    
                    <Form.Item>
                        <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                        </Form.Item>
                    </Form.Item>
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="auth-button" loading={loading} block>
                            Đăng nhập
                        </Button>
                    </Form.Item>
                    <div className="auth-footer">
                        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default Login;