import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Typography, Card, Steps, List, Avatar, Divider, Skeleton, Row, Col, message } from 'antd';
import { ShoppingCartOutlined, WalletOutlined } from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import orderService from '../services/orderService';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrderDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchOrderDetail = async () => {
        setLoading(true);
        try {
            const res = await orderService.getOrderById(id);
            if (res.success) {
                setOrder(res.data);
            }
        } catch (error) {
            message.error("Không thể tải chi tiết đơn hàng!");
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const getStepCurrent = (status) => {
        switch (status) {
            case 'PENDING': return 0;
            case 'PREPARING': return 1;
            case 'SERVED': return 2;
            case 'COMPLETED': return 3;
            case 'CANCELLED': return 0;
            default: return 0;
        }
    };

    const getStepStatus = (status) => {
        if (status === 'CANCELLED') return 'error';
        return 'process';
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#f5f5f5', padding: '40px 0' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
                    <Breadcrumb style={{ marginBottom: '20px', fontSize: '15px' }} separator={<span style={{color: '#999'}}>{'>'}</span>}>
                        <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
                        <Breadcrumb.Item><Link to="/orders">Đơn hàng</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>Chi tiết đơn #{id}</Breadcrumb.Item>
                    </Breadcrumb>

                    {loading ? (
                        <Card style={{ borderRadius: '12px' }}><Skeleton active paragraph={{ rows: 8 }} /></Card>
                    ) : order ? (
                        <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                            <Title level={3} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                                Trạng thái đơn hàng
                            </Title>
                            
                            <div style={{ padding: '30px 0' }}>
                                <Steps 
                                    current={getStepCurrent(order.status)} 
                                    status={getStepStatus(order.status)}
                                    items={[
                                        { title: 'Đã đặt', description: dayjs(order.createdAt).format('HH:mm DD/MM') },
                                        { title: 'Đang chuẩn bị' },
                                        { title: 'Đang phục vụ' },
                                        { title: order.status === 'CANCELLED' ? 'Đã hủy' : 'Hoàn thành' }
                                    ]}
                                />
                            </div>

                            <Divider />

                            <Row gutter={40}>
                                <Col xs={24} md={16}>
                                    <Title level={4}><ShoppingCartOutlined /> Danh sách món</Title>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={order.items || []}
                                        renderItem={item => (
                                            <List.Item>
                                                <List.Item.Meta
                                                    avatar={<Avatar src={item.imageUrl} size={64} shape="square" />}
                                                    title={<span style={{ fontSize: '16px', fontWeight: '600' }}>{item.foodName}</span>}
                                                    description={`Số lượng: ${item.quantity} x ${item.unitPrice?.toLocaleString('vi-VN')} đ`}
                                                />
                                                <div style={{ fontWeight: 'bold', color: '#8b0000', fontSize: '16px' }}>
                                                    {item.totalPrice?.toLocaleString('vi-VN')} đ
                                                </div>
                                            </List.Item>
                                        )}
                                    />
                                </Col>
                                
                                <Col xs={24} md={8}>
                                    <Card style={{ background: '#fafafa', borderRadius: '8px' }}>
                                        <Title level={4}><WalletOutlined /> Thanh toán</Title>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <Text>Tạm tính:</Text>
                                            <Text>{order.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <Text>Phí dịch vụ:</Text>
                                            <Text>0 đ</Text>
                                        </div>
                                        <Divider style={{ margin: '15px 0' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                            <Text strong style={{ fontSize: '24px', color: '#8b0000' }}>
                                                {order.totalAmount?.toLocaleString('vi-VN')} đ
                                            </Text>
                                        </div>
                                    </Card>
                                </Col>
                            </Row>
                        </Card>
                    ) : null}
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default OrderDetail;