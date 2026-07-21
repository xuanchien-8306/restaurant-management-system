import React from 'react';
import { Row, Col, Card, Skeleton, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

const PromotionSection = ({ data, loading }) => {
    const navigate = useNavigate();

    if (loading) return (
        <div style={{ padding: '40px 50px' }}>
            <Skeleton active paragraph={{ rows: 3 }} />
        </div>
    );
    if (!data || data.length === 0) return <Empty description="Chưa có khuyến mãi" />;

    return (
        <div style={{ padding: '40px 50px', background: '#fff9e6' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#d48806' }}>Ưu Đãi Đặc Biệt</h2>
            <Row gutter={[24, 24]}>
                {data.map(promo => (
                    <Col xs={24} md={12} key={promo.id}>
                        <Card 
                            hoverable 
                            onClick={() => navigate(`/promotions/${promo.id}`)}
                            style={{ borderRadius: '12px', overflow: 'hidden', border: 'none', cursor: 'pointer' }}
                            bodyStyle={{ padding: 0 }}
                        >
                            <Row>
                                <Col span={10}>
                                    <img src={promo.imageUrl || 'https://via.placeholder.com/300'} alt={promo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </Col>
                                <Col span={14} style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <h3 style={{ color: '#8b0000', margin: 0 }}>{promo.title}</h3>
                                    <p style={{ color: '#666', marginTop: '10px', marginBottom: 0 }}>{promo.description}</p>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default PromotionSection;