import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Button, List, Badge, message, Space } from 'antd';
import { FireOutlined, CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import kdsApi from '../../api/kdsApi';

dayjs.extend(duration);
const { Title, Text } = Typography;

const COLUMNS = [
    { key: 'PENDING', title: 'Chờ chế biến', color: '#8c8c8c' },
    { key: 'COOKING', title: 'Đang chế biến', color: '#1890ff' },
    { key: 'COMPLETED', title: 'Hoàn thành', color: '#52c41a' },
    { key: 'SERVED', title: 'Đã phục vụ', color: '#722ed1' }
];

const KDS = () => {
    const [orders, setOrders] = useState([]);
    const [now, setNow] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchOrders();

        // 1. Cập nhật Timer hiển thị thời gian chờ mỗi giây
        const timer = setInterval(() => setNow(dayjs()), 1000);

        // 2. Kết nối WebSocket để nhận tín hiệu cập nhật realtime
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to KDS WebSocket');
                stompClient.subscribe('/topic/kds', (message) => {
                    if (message.body === 'REFRESH') {
                        fetchOrders();
                    }
                });
            }
        });
        stompClient.activate();

        return () => {
            clearInterval(timer);
            stompClient.deactivate();
        };
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await kdsApi.getActiveOrders();
            if (res.success) setOrders(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateItem = async (orderId, itemId, status) => {
        try {
            await kdsApi.updateItemStatus(orderId, itemId, status);
            message.success('Cập nhật thành công!');
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleUpdateOrder = async (orderId, status) => {
        try {
            await kdsApi.updateOrderStatus(orderId, status);
            message.success('Đã hoàn thành đơn hàng!');
        } catch (error) {
            message.error('Lỗi khi cập nhật đơn');
        }
    };

    // Parse status từ note field (Dựa vào thiết kế mapToDto ở Backend)
    const parseItem = (item) => {
        const parts = (item.note || '').split('|');
        return {
            ...item,
            status: parts[0] || 'PENDING',
            noteText: parts[1] || ''
        };
    };

    const renderWaitTime = (createdAt) => {
        const diff = now.diff(dayjs(createdAt));
        const min = Math.floor(dayjs.duration(diff).asMinutes());
        const sec = dayjs.duration(diff).seconds();
        
        let color = '#52c41a'; // Xanh
        if (min >= 15) color = '#f5222d'; // Đỏ cảnh báo quá 15 phút
        else if (min >= 10) color = '#faad14'; // Vàng cảnh báo

        return <Tag color={color} icon={<ClockCircleOutlined />}>{min}p {sec}s</Tag>;
    };

    return (
        <div style={{ padding: '0px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={3} style={{ margin: 0 }}><FireOutlined style={{ color: '#d32f2f' }} /> Hệ thống hiển thị Bếp (KDS)</Title>
                <Space>
                    <Badge status="processing" text="Real-time Sync Active" />
                    <Button icon={<SyncOutlined />} onClick={fetchOrders} loading={loading}>Làm mới</Button>
                </Space>
            </div>

            <Row gutter={16} style={{ flex: 1, overflow: 'hidden' }}>
                {COLUMNS.map(col => {
                    const colOrders = orders.filter(o => o.status === col.key);
                    return (
                        <Col span={6} key={col.key} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Card 
                                title={<div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text strong style={{ color: col.color }}>{col.title}</Text>
                                    <Badge count={colOrders.length} style={{ backgroundColor: col.color }} />
                                </div>}
                                size="small"
                                style={{ flex: 1, background: '#f0f2f5', borderRadius: 8, display: 'flex', flexDirection: 'column' }}
                                bodyStyle={{ flex: 1, overflowY: 'auto', padding: 8 }}
                            >
                                {colOrders.map(order => (
                                    <Card 
                                        key={order.id} 
                                        size="small" 
                                        style={{ marginBottom: 12, borderRadius: 8, borderTop: `4px solid ${col.color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text strong style={{ fontSize: 16 }}>{order.tableName}</Text>
                                            {renderWaitTime(order.createdAt)}
                                        </div>
                                        <div style={{ marginBottom: 8 }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>Mã ĐH: {order.orderCode}</Text>
                                        </div>
                                        
                                        <List
                                            size="small"
                                            dataSource={order.items.map(parseItem)}
                                            renderItem={item => (
                                                <List.Item 
                                                    style={{ padding: '8px 0', borderBottom: '1px dashed #f0f0f0' }}
                                                    actions={[
                                                        item.status === 'PENDING' && <Button size="small" type="primary" onClick={() => handleUpdateItem(order.id, item.id, 'COOKING')}>Nấu</Button>,
                                                        item.status === 'COOKING' && <Button size="small" type="primary" style={{ background: '#52c41a' }} onClick={() => handleUpdateItem(order.id, item.id, 'COMPLETED')}>Xong</Button>
                                                    ].filter(Boolean)}
                                                >
                                                    <List.Item.Meta
                                                        title={<Text delete={item.status === 'COMPLETED' || item.status === 'SERVED'}>{item.quantity} x {item.menuItemName}</Text>}
                                                        description={item.noteText && <Text type="danger" style={{fontSize: 12}}>{item.noteText}</Text>}
                                                    />
                                                </List.Item>
                                            )}
                                        />

                                        {col.key === 'COOKING' && (
                                            <Button block type="primary" style={{ background: '#52c41a', marginTop: 12 }} icon={<CheckCircleOutlined />} onClick={() => handleUpdateOrder(order.id, 'COMPLETED')}>
                                                Hoàn thành tất cả
                                            </Button>
                                        )}
                                        {col.key === 'COMPLETED' && (
                                            <Button block type="default" style={{ marginTop: 12 }} onClick={() => handleUpdateOrder(order.id, 'SERVED')}>
                                                Đã mang ra bàn
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                                {colOrders.length === 0 && <div style={{ textAlign: 'center', marginTop: 50, color: '#aaa' }}>Không có đơn hàng</div>}
                            </Card>
                        </Col>
                    );
                })}
            </Row>
        </div>
    );
};

export default KDS;