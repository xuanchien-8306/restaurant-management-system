import React, { useEffect, useState } from 'react';
import { Layout, Typography, List, Card, Tag, Button, Skeleton, Empty, Row, Col } from 'antd';
import { ShoppingOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import orderService from '../services/orderService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderService.getMyOrders();
            if (res.success) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn hàng", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        switch (status) {
            case 'PENDING': return <Tag color="blue">Đang chờ xử lý</Tag>;
            case 'PREPARING': return <Tag color="orange">Đang chuẩn bị</Tag>;
            case 'COMPLETED': return <Tag color="green">Đã hoàn thành</Tag>;
            case 'CANCELLED': return <Tag color="red">Đã hủy</Tag>;
            default: return <Tag color="default">{status}</Tag>;
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#f5f5f5', padding: '40px 0' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                        <ShoppingOutlined style={{ fontSize: '32px', color: '#8b0000', marginRight: '15px' }} />
                        <Title level={2} style={{ margin: 0, color: '#333' }}>Đơn Hàng Của Tôi</Title>
                    </div>

                    {loading ? (
                        <Skeleton active paragraph={{ rows: 10 }} />
                    ) : orders.length === 0 ? (
                        <Empty description="Bạn chưa có đơn hàng nào." style={{ marginTop: '50px', background: '#fff', padding: '50px', borderRadius: '12px' }} />
                    ) : (
                        <List
                            grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
                            dataSource={orders}
                            renderItem={order => (
                                <List.Item>
                                    <Card 
                                        hoverable 
                                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                    >
                                        <Row align="middle" justify="space-between">
                                            <Col xs={24} md={16}>
                                                <Title level={4} style={{ margin: 0 }}>Mã đơn: #{order.id}</Title>
                                                <div style={{ marginTop: '10px', color: '#666' }}>
                                                    <p style={{ margin: '5px 0' }}><ClockCircleOutlined /> Ngày đặt: {dayjs(order.createdAt).format('DD/MM/YYYY HH:mm')}</p>
                                                    <p style={{ margin: '5px 0', fontSize: '16px', fontWeight: 'bold', color: '#8b0000' }}>
                                                        Tổng tiền: {order.totalAmount?.toLocaleString('vi-VN')} đ
                                                    </p>
                                                </div>
                                            </Col>
                                            <Col xs={24} md={8} style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                                {getStatusTag(order.status)}
                                                <Button 
                                                    type="primary" 
                                                    icon={<EyeOutlined />} 
                                                    style={{ background: '#8b0000', borderColor: '#8b0000' }}
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Orders;  