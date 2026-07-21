import React from 'react';
import { Card, Row, Col, Skeleton, Empty, Button, message, Badge } from 'antd';
import { ShoppingCartOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/useCartStore';

const { Meta } = Card;

const FeaturedFood = ({ data, loading }) => {
    const navigate = useNavigate();
    const { addToCart } = useCartStore();

    const handleAddToCart = (e, food) => {
        e.stopPropagation();
        addToCart(food);
        message.success(`Đã thêm ${food.name} vào giỏ hàng`);
    };

    if (loading) return (
        <div style={{ padding: '40px 50px' }}>
            <Skeleton active paragraph={{ rows: 4 }} />
        </div>
    );
    if (!data || data.length === 0) return <Empty description="Chưa có món nổi bật" />;

    return (
        <div style={{ padding: '40px 50px' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Món Nổi Bật</h2>
            <Row gutter={[24, 24]}>
                {data.map(food => (
                    <Col xs={24} sm={12} md={6} key={food.id}>
                        <Badge.Ribbon text="Hot" color="red">
                            <Card
                                hoverable
                                onClick={() => navigate(`/menu/${food.id}`)}
                                cover={<img alt={food.name} src={food.imageUrl || 'https://via.placeholder.com/300x200'} style={{ height: '200px', objectFit: 'cover' }} />}
                                actions={[
                                    <Button type="text" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); navigate(`/menu/${food.id}`); }}>Chi tiết</Button>,
                                    <Button type="text" icon={<ShoppingCartOutlined />} onClick={(e) => handleAddToCart(e, food)} style={{ color: '#8b0000' }}>Đặt món</Button>
                                ]}
                                style={{ borderRadius: '12px', overflow: 'hidden' }}
                            >
                                <Meta 
                                    title={food.name} 
                                    description={
                                        <div>
                                            <p style={{ margin: 0, color: '#888', fontSize: '12px', height: '18px', overflow: 'hidden' }}>{food.description}</p>
                                            <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#8b0000', fontSize: '18px' }}>
                                                {food.price.toLocaleString('vi-VN')} đ
                                            </p>
                                        </div>
                                    } 
                                />
                            </Card>
                        </Badge.Ribbon>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default FeaturedFood;