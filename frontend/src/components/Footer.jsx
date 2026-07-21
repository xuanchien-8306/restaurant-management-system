import React from 'react';
import { Row, Col } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, FacebookOutlined, InstagramOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const AppFooter = () => {
    return (
        <div style={{ background: '#1f1f1f', color: '#fff', padding: '50px 50px 20px', marginTop: 'auto' }}>
            <Row gutter={[24, 24]}>
                <Col xs={24} md={6}>
                    <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '20px' }}>RMS Restaurant</h3>
                    <p style={{ color: '#aaa' }}>Hương vị tinh tế, không gian sang trọng. Sự hài lòng của bạn là niềm vinh hạnh của chúng tôi.</p>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px' }}>Liên Kết</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '2.5' }}>
                        <li><Link to="/about" style={{ color: '#aaa', textDecoration: 'none' }}>Giới thiệu</Link></li>
                        <li><Link to="/contact" style={{ color: '#aaa', textDecoration: 'none' }}>Liên hệ</Link></li>
                        <li><Link to="/terms" style={{ color: '#aaa', textDecoration: 'none' }}>Điều khoản sử dụng</Link></li>
                        <li><Link to="/privacy" style={{ color: '#aaa', textDecoration: 'none' }}>Chính sách bảo mật</Link></li>
                    </ul>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px' }}>Liên Hệ</h3>
                    <p style={{ color: '#aaa' }}><EnvironmentOutlined /> 123 Đường Ẩm Thực, Quận 1, TP.HCM</p>
                    <p style={{ color: '#aaa' }}><PhoneOutlined /> Hotline: 1900 1234</p>
                    <p style={{ color: '#aaa' }}><MailOutlined /> Email: contact@rms-restaurant.com</p>
                </Col>
                <Col xs={24} md={6}>
                    <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '20px' }}>Kết Nối</h3>
                    <div style={{ fontSize: '28px', display: 'flex', gap: '15px' }}>
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#1877f2'} onMouseOut={(e) => e.target.style.color = '#aaa'}>
                            <FacebookOutlined />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#e1306c'} onMouseOut={(e) => e.target.style.color = '#aaa'}>
                            <InstagramOutlined />
                        </a>
                        <a href="https://zalo.me" target="_blank" rel="noopener noreferrer" style={{ color: '#aaa', transition: 'color 0.3s' }} onMouseOver={(e) => e.target.style.color = '#0068ff'} onMouseOut={(e) => e.target.style.color = '#aaa'}>
                            <WhatsAppOutlined />
                        </a>
                    </div>
                </Col>
            </Row>
            <div style={{ textAlign: 'center', borderTop: '1px solid #333', marginTop: '30px', paddingTop: '20px', color: '#666', fontSize: '14px' }}>
                © {new Date().getFullYear()} RMS Restaurant. Đã đăng ký bản quyền.
            </div>
        </div>
    );
};

export default AppFooter;