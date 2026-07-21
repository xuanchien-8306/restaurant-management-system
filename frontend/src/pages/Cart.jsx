import React, { useState } from 'react';
import { Layout, Breadcrumb, Row, Col, Card, Typography, Button, Input, InputNumber, Divider, Empty, message, Popconfirm } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined, ShoppingCartOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import orderService from '../services/orderService';
import './Cart.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const Cart = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { cart, increase, decrease, updateQuantity, updateNote, removeItem, clearCart, getTotalPrice } = useCartStore();
    const [loading, setLoading] = useState(false);

    const subTotal = getTotalPrice();
    const vat = subTotal * 0.1; // 10% VAT
    const discount = 0; 
    const finalTotal = subTotal + vat - discount;

    const handleOrder = async () => {
        if (!token) {
            message.warning('Vui lòng đăng nhập để đặt món!');
            navigate('/login');
            return;
        }

        if (cart.length === 0) {
            message.warning('Giỏ hàng của bạn đang trống!');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                orderType: 'ONLINE',
                note: '',
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    note: item.note || '',
                    unitPrice: item.price
                }))
            };

            const res = await orderService.createOrder(payload);
            if (res.success) {
                message.success('Đặt món thành công!');
                clearCart();
                navigate('/orders');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra khi đặt món');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#fcfcfc', padding: '40px 0' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <Breadcrumb style={{ marginBottom: '20px', fontSize: '15px' }} separator=">">
                        <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
                        <Breadcrumb.Item>Giỏ hàng</Breadcrumb.Item>
                    </Breadcrumb>

                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                        <ShoppingCartOutlined style={{ fontSize: '32px', color: '#8b0000', marginRight: '15px' }} />
                        <Title level={2} style={{ margin: 0, color: '#333' }}>Giỏ hàng của bạn</Title>
                    </div>

                    {cart.length === 0 ? (
                        <Card style={{ borderRadius: '12px', textAlign: 'center', padding: '50px 0' }}>
                            <Empty 
                                description={<span style={{ fontSize: '16px', color: '#666' }}>Giỏ hàng hiện đang trống</span>} 
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                            <Button type="primary" size="large" onClick={() => navigate('/menu')} style={{ marginTop: '20px', background: '#8b0000', borderColor: '#8b0000' }}>
                                Khám phá thực đơn ngay
                            </Button>
                        </Card>
                    ) : (
                        <Row gutter={[32, 32]}>
                            <Col xs={24} lg={16}>
                                <div className="cart-items-container">
                                    {cart.map(item => (
                                        <Card key={item.id} className="cart-item-card" bordered={false}>
                                            <Row gutter={16} align="middle">
                                                <Col xs={8} sm={4}>
                                                    <img src={item.imageUrl || 'https://via.placeholder.com/150'} alt={item.name} className="cart-item-img" />
                                                </Col>
                                                <Col xs={16} sm={10}>
                                                    <h3 className="cart-item-title">{item.name}</h3>
                                                    <p className="cart-item-price">{item.price?.toLocaleString('vi-VN')} đ</p>
                                                    <div className="cart-item-note">
                                                        <Input 
                                                            prefix={<EditOutlined style={{ color: '#aaa' }} />} 
                                                            placeholder="Ghi chú (VD: Không hành, ít cay...)" 
                                                            value={item.note}
                                                            onChange={(e) => updateNote(item.id, e.target.value)}
                                                            bordered={false}
                                                            style={{ padding: 0, borderBottom: '1px solid #eee', borderRadius: 0, boxShadow: 'none' }}
                                                        />
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={6}>
                                                    <div className="cart-quantity-controls">
                                                        <Button onClick={() => decrease(item.id)}>-</Button>
                                                        <InputNumber 
                                                            min={1} 
                                                            value={item.quantity} 
                                                            onChange={(val) => updateQuantity(item.id, val)} 
                                                            controls={false}
                                                            className="cart-quantity-input"
                                                        />
                                                        <Button onClick={() => increase(item.id)}>+</Button>
                                                    </div>
                                                </Col>
                                                <Col xs={12} sm={4} style={{ textAlign: 'right' }}>
                                                    <h4 className="cart-item-total">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</h4>
                                                    <Popconfirm title="Xóa món này?" onConfirm={() => removeItem(item.id)} okText="Có" cancelText="Không">
                                                        <Button type="text" danger icon={<DeleteOutlined />} className="btn-remove-item">Xóa</Button>
                                                    </Popconfirm>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </div>
                                <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/menu')} className="btn-continue-shopping">
                                    Tiếp tục gọi món
                                </Button>
                            </Col>

                            <Col xs={24} lg={8}>
                                <Card className="cart-summary-card" bordered={false}>
                                    <Title level={4} style={{ borderBottom: '1px solid #eee', paddingBottom: '15px' }}>Tóm tắt đơn hàng</Title>
                                    
                                    <div className="summary-row">
                                        <Text>Tạm tính:</Text>
                                        <Text strong>{subTotal.toLocaleString('vi-VN')} đ</Text>
                                    </div>
                                    <div className="summary-row">
                                        <Text>Thuế VAT (10%):</Text>
                                        <Text strong>{vat.toLocaleString('vi-VN')} đ</Text>
                                    </div>
                                    {discount > 0 && (
                                        <div className="summary-row" style={{ color: '#52c41a' }}>
                                            <Text style={{ color: 'inherit' }}>Giảm giá:</Text>
                                            <Text strong style={{ color: 'inherit' }}>- {discount.toLocaleString('vi-VN')} đ</Text>
                                        </div>
                                    )}
                                    
                                    <Divider style={{ margin: '15px 0' }} />
                                    
                                    <div className="summary-row total-row">
                                        <Text>Tổng thanh toán:</Text>
                                        <Text className="total-amount">{finalTotal.toLocaleString('vi-VN')} đ</Text>
                                    </div>

                                    <Button 
                                        type="primary" 
                                        size="large" 
                                        block 
                                        className="btn-checkout" 
                                        onClick={handleOrder}
                                        loading={loading}
                                    >
                                        Đặt món ngay
                                    </Button>
                                </Card>
                            </Col>
                        </Row>
                    )}
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default Cart;