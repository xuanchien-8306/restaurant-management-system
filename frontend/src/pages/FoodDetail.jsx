import React, { useState, useEffect } from 'react';
import { Layout, Breadcrumb, Row, Col, Typography, Button, Rate, Tag, Divider, Tabs, List, Avatar, Skeleton, message } from 'antd';
import { ShoppingCartOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AppFooter from '../components/Footer';
import menuService from '../services/menuService';
import useCartStore from '../store/useCartStore';
import './FoodDetail.css';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const FoodDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCartStore();
    
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFoodDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchFoodDetail = async () => {
        setLoading(true);
        try {
            const res = await menuService.getMenuById(id);
            if (res.success) {
                setFood(res.data);
            }
        } catch (error) {
            message.error("Không thể tải thông tin món ăn!");
            navigate('/menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(food);
        message.success(`Đã thêm ${food.name} vào giỏ hàng`);
    };

    const tabItems = [
        {
            key: '1',
            label: 'Mô tả chi tiết',
            children: (
                <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                    <Paragraph>{food?.description || 'Chưa có mô tả chi tiết cho món ăn này.'}</Paragraph>
                    <Title level={4} style={{ marginTop: '20px' }}>Thành phần nguyên liệu:</Title>
                    {food?.ingredients && food.ingredients.length > 0 ? (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {food.ingredients.map((ing, idx) => (
                                <Tag color="green" key={idx} style={{ padding: '4px 10px', fontSize: '14px' }}>{ing}</Tag>
                            ))}
                        </div>
                    ) : (
                        <Text type="secondary">Đang cập nhật nguyên liệu...</Text>
                    )}
                </div>
            )
        },
        {
            key: '2',
            label: `Đánh giá (${food?.reviews?.length || 0})`,
            children: (
                <List
                    itemLayout="horizontal"
                    dataSource={food?.reviews || []}
                    locale={{ emptyText: 'Chưa có đánh giá nào.' }}
                    renderItem={(review) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={<Avatar icon={<UserOutlined />} />}
                                title={
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{review.customerName}</span>
                                        <Text type="secondary" style={{ fontSize: '12px' }}>
                                            {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : ''}
                                        </Text>
                                    </div>
                                }
                                description={
                                    <div>
                                        <Rate disabled defaultValue={review.rating} style={{ fontSize: '14px', color: '#faad14' }} />
                                        <p style={{ marginTop: '8px', color: '#333' }}>{review.comment}</p>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            )
        }
    ];

    return (
        <Layout className="layout" style={{ minHeight: '100vh' }}>
            <Navbar />
            <Content style={{ background: '#fff' }}>
                <div style={{ padding: '30px 50px', maxWidth: '1200px', margin: '0 auto' }}>
                    {loading ? (
                        <Skeleton active avatar={{ shape: 'square', size: 300 }} paragraph={{ rows: 10 }} />
                    ) : food ? (
                        <>
                            <Breadcrumb style={{ marginBottom: '30px', fontSize: '16px' }} separator={<span style={{color: '#999'}}>{'>'}</span>}>
                                <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
                                <Breadcrumb.Item><Link to="/menu">Thực đơn</Link></Breadcrumb.Item>
                                <Breadcrumb.Item>{food.name}</Breadcrumb.Item>
                            </Breadcrumb>

                            <Row gutter={[48, 48]}>
                                <Col xs={24} md={12}>
                                    <div className="food-detail-image">
                                        <img src={food.imageUrl} alt={food.name} />
                                    </div>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Tag color="#8b0000" style={{ marginBottom: '15px', fontSize: '14px', padding: '4px 12px' }}>
                                        {food.categoryName}
                                    </Tag>
                                    <Title level={1} style={{ margin: '0 0 15px 0' }}>{food.name}</Title>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                        <Rate disabled allowHalf defaultValue={food.averageRating} style={{ color: '#faad14' }} />
                                        <Text type="secondary">({food.averageRating} / 5) - {food.reviews?.length || 0} Đánh giá</Text>
                                    </div>

                                    <Title level={2} style={{ color: '#8b0000', margin: '0 0 25px 0' }}>
                                        {food.price.toLocaleString('vi-VN')} đ
                                    </Title>

                                    <Paragraph style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
                                        {food.description}
                                    </Paragraph>

                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <Button 
                                            type="primary" 
                                            icon={<ShoppingCartOutlined />} 
                                            size="large" 
                                            className="btn-add-cart"
                                            onClick={handleAddToCart}
                                        >
                                            Thêm vào giỏ hàng
                                        </Button>
                                        <Button 
                                            icon={<CalendarOutlined />} 
                                            size="large" 
                                            className="btn-book-table"
                                            onClick={() => navigate('/booking')}
                                        >
                                            Đặt bàn ngay
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            <Divider style={{ margin: '50px 0' }} />

                            <Tabs defaultActiveKey="1" items={tabItems} className="custom-tabs" />
                        </>
                    ) : null}
                </div>
            </Content>
            <AppFooter />
        </Layout>
    );
};

export default FoodDetail;