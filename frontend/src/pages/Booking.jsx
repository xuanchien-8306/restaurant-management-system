import React, { useEffect, useState } from 'react';
import { Layout, Form, Input, InputNumber, DatePicker, TimePicker, Button, Row, Col, Typography, message, Card } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, TeamOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import customerService from '../services/customerService';
import bookingService from '../services/bookingService';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Booking = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProfileForPrefill();
    }, []);

    const fetchProfileForPrefill = async () => {
        try {
            const res = await customerService.getProfile();
            if (res.success) {
                form.setFieldsValue({
                    fullName: res.data.fullName,
                    phone: res.data.phone
                });
            }
        } catch (error) {
            console.error("Lỗi lấy thông tin KH", error);
        }
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                fullName: values.fullName,
                phone: values.phone,
                date: values.date.format('YYYY-MM-DD'),
                time: values.time.format('HH:mm:ss'),
                guestCount: values.guestCount,
                note: values.note
            };
            
            const res = await bookingService.createBooking(payload);
            if (res.success) {
                message.success('Đặt bàn thành công! Hệ thống đang chuyển về danh sách đơn...');
                form.resetFields(['date', 'time', 'guestCount', 'note']);
                setTimeout(() => {
                    navigate('/orders');
                }, 1500);
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt bàn');
        } finally {
            setLoading(false);
        }
    };

    const disabledDate = (current) => {
        return current && current < dayjs().startOf('day');
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#f5f5f5', padding: '40px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <Row gutter={[40, 40]} align="middle">
                        <Col xs={24} md={10}>
                            <div className="booking-info">
                                <Title level={2} style={{ color: '#8b0000', marginBottom: '20px' }}>
                                    Trải nghiệm không gian sang trọng
                                </Title>
                                <Text style={{ fontSize: '16px', color: '#555', display: 'block', marginBottom: '30px' }}>
                                    Đặt bàn ngay hôm nay để tận hưởng những món ăn tinh túy nhất cùng gia đình và người thân trong không gian ấm cúng tại RMS Restaurant.
                                </Text>
                                <img 
                                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" 
                                    alt="Restaurant Interior" 
                                    style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                            </div>
                        </Col>
                        
                        <Col xs={24} md={14}>
                            <Card className="booking-card" bordered={false}>
                                <Title level={3} style={{ textAlign: 'center', marginBottom: '30px' }}>Phiếu Đặt Bàn</Title>
                                <Form
                                    form={form}
                                    layout="vertical"
                                    onFinish={onFinish}
                                    size="large"
                                >
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item 
                                                name="fullName" 
                                                label="Họ và tên" 
                                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                                            >
                                                <Input placeholder="Nhập họ và tên" />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item 
                                                name="phone" 
                                                label="Số điện thoại" 
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                                            >
                                                <Input placeholder="Nhập số điện thoại" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={8}>
                                            <Form.Item 
                                                name="date" 
                                                label="Ngày đến" 
                                                rules={[{ required: true, message: 'Chọn ngày' }]}
                                            >
                                                <DatePicker 
                                                    style={{ width: '100%' }} 
                                                    disabledDate={disabledDate} 
                                                    format="DD/MM/YYYY"
                                                    suffixIcon={<CalendarOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item 
                                                name="time" 
                                                label="Giờ đến" 
                                                rules={[{ required: true, message: 'Chọn giờ' }]}
                                            >
                                                <TimePicker 
                                                    style={{ width: '100%' }} 
                                                    format="HH:mm" 
                                                    minuteStep={15}
                                                    suffixIcon={<ClockCircleOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={8}>
                                            <Form.Item 
                                                name="guestCount" 
                                                label="Số khách" 
                                                rules={[{ required: true, message: 'Nhập số khách' }]}
                                            >
                                                <InputNumber 
                                                    min={1} 
                                                    max={50} 
                                                    style={{ width: '100%' }} 
                                                    addonBefore={<TeamOutlined />}
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item name="note" label="Ghi chú thêm (Không bắt buộc)">
                                        <Input.TextArea 
                                            rows={4} 
                                            placeholder="Yêu cầu ghế trẻ em, trang trí sinh nhật, vị trí bàn..." 
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginTop: '20px', marginBottom: 0 }}>
                                        <Button 
                                            type="primary" 
                                            htmlType="submit" 
                                            className="btn-submit-booking" 
                                            loading={loading}
                                            block
                                            icon={<EditOutlined />}
                                        >
                                            Xác Nhận Đặt Bàn
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Booking;