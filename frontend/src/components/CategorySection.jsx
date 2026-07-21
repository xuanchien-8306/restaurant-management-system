import React from 'react';
import { Card, Row, Col, Skeleton, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

const CategorySection = ({ data, loading }) => {
    const navigate = useNavigate();

    if (loading) return (
        <div style={{ padding: '40px 50px' }}>
            <Skeleton active paragraph={{ rows: 2 }} />
        </div>
    );
    if (!data || data.length === 0) return <Empty description="Chưa có danh mục" />;

    return (
        <div style={{ padding: '40px 50px', background: '#fafafa' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Khám Phá Thực Đơn</h2>
            <Row gutter={[24, 24]}>
                {data.map(cat => (
                    <Col xs={24} sm={12} md={6} key={cat.id}>
                        <Card 
                            hoverable 
                            onClick={() => navigate(`/menu?category=${cat.id}`)}
                            style={{ borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', cursor: 'pointer' }}
                        >
                            <h3 style={{ color: '#8b0000' }}>{cat.name}</h3>
                            <p style={{ color: '#666', marginBottom: 0 }}>{cat.description}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default CategorySection;