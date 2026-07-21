import React, { useState } from 'react';
import { Layout, Breadcrumb, Row, Col, Card, Form, Input, Button, Typography, message, Divider } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, FacebookOutlined, WhatsAppOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import contactService from '../services/contactService';
import './Contact.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const Contact = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await contactService.submitContact(values);
            if (res.success) {
                message.success('Gửi liên hệ thành công! Chúng tôi sẽ phản hồi sớm nhất.');
                form.resetFields();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi liên hệ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#fcfcfc' }}>
                <div className="contact-banner">
                    <div className="contact-banner-overlay">
                        <h1>LIÊN HỆ VỚI CHÚNG TÔI</h1>
                        <Breadcrumb style={{ color: '#fff', fontSize: '16px' }} separator={<span style={{color: '#fff'}}>{'>'}</span>}>
                            <Breadcrumb.Item><Link to="/" style={{ color: '#fff' }}>Trang chủ</Link></Breadcrumb.Item>
                            <Breadcrumb.Item style={{ color: '#ff9800' }}>Liên hệ</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                </div>

                <div style={{ padding: '60px 50px', maxWidth: '1200px', margin: '0 auto' }}>
                    <Row gutter={[48, 48]}>
                        <Col xs={24} md={10}>
                            <div className="contact-info-wrapper">
                                <Title level={2} style={{ color: '#d32f2f', marginBottom: '20px' }}>Thông Tin Liên Hệ</Title>
                                <Paragraph style={{ fontSize: '16px', color: '#555', marginBottom: '30px' }}>
                                    Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy liên hệ với RMS Restaurant qua các kênh dưới đây.
                                </Paragraph>

                                <div className="contact-info-item">
                                    <div className="contact-icon"><EnvironmentOutlined /></div>
                                    <div className="contact-text">
                                        <h4>Địa chỉ</h4>
                                        <p>123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon"><PhoneOutlined /></div>
                                    <div className="contact-text">
                                        <h4>Hotline</h4>
                                        <p>1900 1234 - 0988 777 666</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon"><MailOutlined /></div>
                                    <div className="contact-text">
                                        <h4>Email</h4>
                                        <p>contact@rms-restaurant.com</p>
                                    </div>
                                </div>

                                <div className="contact-info-item">
                                    <div className="contact-icon" style={{ color: '#ff9800' }}><ClockCircleOutlined /></div>
                                    <div className="contact-text">
                                        <h4>Giờ mở cửa</h4>
                                        <p>Thứ 2 - Chủ Nhật: 08:00 - 23:00</p>
                                    </div>
                                </div>

                                <Divider />

                                <h4>Kết nối với chúng tôi</h4>
                                <div className="social-links">
                                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon fb"><FacebookOutlined /></a>
                                    <a href="https://zalo.me" target="_blank" rel="noreferrer" className="social-icon zalo"><WhatsAppOutlined /></a>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={14}>
                            <Card className="contact-form-card" bordered={false}>
                                <Title level={3} style={{ marginBottom: '25px', color: '#333' }}>Gửi tin nhắn cho chúng tôi</Title>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    size="large"
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item 
                                                name="name" 
                                                label="Họ và tên" 
                                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                            >
                                                <Input placeholder="Nhập họ và tên của bạn" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item 
                                                name="email" 
                                                label="Email" 
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email' },
                                                    { type: 'email', message: 'Email không hợp lệ' }
                                                ]}
                                            >
                                                <Input placeholder="Nhập địa chỉ email" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item 
                                        name="subject" 
                                        label="Tiêu đề" 
                                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                                    >
                                        <Input placeholder="Bạn cần hỗ trợ vấn đề gì?" />
                                    </Form.Item>

                                    <Form.Item 
                                        name="message" 
                                        label="Nội dung" 
                                        rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
                                    >
                                        <Input.TextArea rows={5} placeholder="Nhập nội dung chi tiết..." />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            className="btn-submit-contact" 
                                            loading={loading}
                                            icon={<SendOutlined />}
                                        >
                                            Gửi Tin Nhắn
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>

                    {/* Google Maps Placeholder */}
                    <div className="map-container" style={{ marginTop: '60px' }}>
                        <iframe 
                            title="Restaurant Location"
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4602324217116!2d106.69758091480082!3d10.776019492321853!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703edc!2sIndependence%20Palace!5e0!3m2!1sen!2s!4v1684307525316!5m2!1sen!2s" 
                            width="100%" 
                            height="450" 
                            style={{ border: 0, borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} 
                            allowFullScreen="" 
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Contact;