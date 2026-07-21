import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Skeleton, Typography } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

const { Title } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await adminApi.getDashboardStats();
            if (res.success) {
                setStats(res.data);
            }
        } catch (error) {
            console.error("Lỗi lấy dữ liệu dashboard", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Skeleton active paragraph={{ rows: 10 }} />;
    }

    return (
        <div>
            <Title level={3} style={{ marginBottom: '24px' }}>Tổng quan hôm nay</Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#e3f2fd', borderRadius: '12px' }}>
                        <Statistic
                            title="Doanh thu hôm nay"
                            value={stats?.todayRevenue || 0}
                            precision={0}
                            valueStyle={{ color: '#d32f2f', fontWeight: 'bold' }}
                            prefix={<DollarOutlined />}
                            suffix="đ"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#e8f5e9', borderRadius: '12px' }}>
                        <Statistic
                            title="Đơn hàng hôm nay"
                            value={stats?.todayOrders || 0}
                            valueStyle={{ color: '#1976d2', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#fff3e0', borderRadius: '12px' }}>
                        <Statistic
                            title="Đơn đang phục vụ"
                            value={stats?.servingGuests || 0}
                            valueStyle={{ color: '#388e3c', fontWeight: 'bold' }}
                            prefix={<TeamOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} style={{ background: '#f3e5f5', borderRadius: '12px' }}>
                        <Statistic
                            title="Tổng Khách hàng"
                            value={stats?.totalCustomers || 0}
                            valueStyle={{ color: '#7b1fa2', fontWeight: 'bold' }}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: '30px' }}>
                <Col xs={24} lg={16}>
                    <Card title="Biểu đồ doanh thu" bordered={false} style={{ borderRadius: '12px', minHeight: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#999' }}>
                            Khu vực nhúng biểu đồ (Chart.js / Recharts)
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Món bán chạy" bordered={false} style={{ borderRadius: '12px', minHeight: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px', color: '#999' }}>
                            Danh sách món bán chạy nhất
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;