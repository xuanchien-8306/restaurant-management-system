import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Input, List, Tag, message, Badge, Space, InputNumber, Divider, Empty } from 'antd';
import { AppstoreOutlined, ShoppingCartOutlined, FireOutlined, CheckCircleOutlined, DeleteOutlined, PrinterOutlined, DollarOutlined } from '@ant-design/icons';
import tableApi from '../../api/tableApi';
import menuAdminApi from '../../api/menuAdminApi';
import posApi from '../../api/posApi';
import PosPaymentModal from '../../components/admin/PosPaymentModal';

const { Title, Text } = Typography;

const TABLE_COLORS = {
    'AVAILABLE': '#52c41a',
    'IN_USE': '#1890ff',
    'CLEANING': '#8c8c8c',
    'RESERVED': '#faad14',
    'PAYING': '#722ed1',
    'DISABLED': '#f5222d'
};

const POS = () => {
    const [tables, setTables] = useState([]);
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    
    const [activeTable, setActiveTable] = useState(null);
    const [activeOrder, setActiveOrder] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchMenu, setSearchMenu] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    useEffect(() => {
        fetchTables();
        fetchMenuData();
    }, []);

    const fetchTables = async () => {
        try {
            const res = await tableApi.getAllTables();
            if (res.success) setTables(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMenuData = async () => {
        try {
            const [catRes, menuRes] = await Promise.all([
                menuAdminApi.getCategories(),
                menuAdminApi.getMenuItems({ page: 0, size: 100 }) // Load max cho POS
            ]);
            if (catRes.success) setCategories(catRes.data);
            if (menuRes.success) setMenuItems(menuRes.data.content);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSelectTable = async (table) => {
        setActiveTable(table);
        setLoading(true);
        try {
            const res = await posApi.getActiveOrder(table.id);
            setActiveOrder(res.success ? res.data : null);
        } catch (error) {
            setActiveOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = async (menuItem) => {
        if (!activeTable) {
            message.warning('Vui lòng chọn bàn trước!');
            return;
        }
        if (activeTable.status === 'CLEANING' || activeTable.status === 'PAYING') {
            message.error('Bàn đang dọn hoặc đang thanh toán, không thể gọi thêm món!');
            return;
        }

        try {
            const res = await posApi.addItem(activeTable.id, { menuItemId: menuItem.id, quantity: 1 });
            if (res.success) {
                setActiveOrder(res.data);
                // Cập nhật lại màu bàn nếu từ Trống -> Đang phục vụ
                if (activeTable.status === 'AVAILABLE') fetchTables();
            }
        } catch (error) {
            message.error('Lỗi khi thêm món');
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        try {
            const res = await posApi.updateItem(activeOrder.id, itemId, { quantity: newQuantity });
            if (res.success) setActiveOrder(res.data);
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi cập nhật');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            const res = await posApi.removeItem(activeOrder.id, itemId);
            if (res.success) {
                setActiveOrder(res.data?.id ? res.data : null);
                if (!res.data?.id) fetchTables(); // Nếu xóa hết món, bàn về Trống
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi xóa món');
        }
    };

    const handleSendKitchen = async () => {
        if (!activeOrder) return;
        try {
            const res = await posApi.sendToKitchen(activeOrder.id);
            if (res.success) {
                message.success('Đã báo bếp!');
                setActiveOrder(res.data);
            }
        } catch (error) {
            message.error('Lỗi báo bếp');
        }
    };

    const handlePayment = async (values) => {
        setLoading(true);
        try {
            const res = await posApi.payOrder(activeOrder.id, values);
            if (res.success) {
                message.success('Thanh toán thành công!');
                setIsPaymentOpen(false);
                setActiveOrder(null);
                setActiveTable(null);
                fetchTables(); // Cập nhật lại màu bàn thành CLEANING
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi thanh toán');
        } finally {
            setLoading(false);
        }
    };

    // Lọc menu items
    const filteredMenu = menuItems.filter(m => {
        const matchCat = activeCategory ? m.categoryId === activeCategory : true;
        const matchSearch = m.name.toLowerCase().includes(searchMenu.toLowerCase());
        return matchCat && matchSearch;
    });

    const renderOrderStatus = (statusStr) => {
        if (!statusStr) return null;
        const status = statusStr.split('|')[0];
        if (status === 'PENDING') return <Tag color="default">Chờ chế biến</Tag>;
        if (status === 'COOKING') return <Tag color="processing">Đang chế biến</Tag>;
        return <Tag color="success">Hoàn thành</Tag>;
    };

    return (
        <div style={{ height: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column' }}>
            <Row gutter={16} style={{ flex: 1, overflow: 'hidden' }}>
                
                {/* CỘT 1: SƠ ĐỒ BÀN */}
                <Col span={6} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card title={<><AppstoreOutlined /> Sơ đồ bàn</>} size="small" style={{ flex: 1, overflowY: 'auto', borderRadius: 8 }}>
                        <Row gutter={[8, 8]}>
                            {tables.map(table => (
                                <Col span={12} key={table.id}>
                                    <div 
                                        onClick={() => handleSelectTable(table)}
                                        style={{
                                            border: `2px solid ${activeTable?.id === table.id ? '#000' : 'transparent'}`,
                                            borderRadius: 8,
                                            padding: '10px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            background: '#fff',
                                            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                            borderTop: `6px solid ${TABLE_COLORS[table.status]}`
                                        }}
                                    >
                                        <Text strong>{table.name}</Text>
                                        <div style={{ fontSize: 11, color: '#888' }}>{table.areaName}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>

                {/* CỘT 2: MENU MÓN ĂN */}
                <Col span={10} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card size="small" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 8 }}>
                        <Input.Search 
                            placeholder="Tìm món ăn..." 
                            style={{ marginBottom: 12 }} 
                            onChange={e => setSearchMenu(e.target.value)} 
                        />
                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', marginBottom: 12, paddingBottom: 8 }}>
                            <Tag.CheckableTag checked={activeCategory === null} onChange={() => setActiveCategory(null)}>Tất cả</Tag.CheckableTag>
                            {categories.map(c => (
                                <Tag.CheckableTag key={c.id} checked={activeCategory === c.id} onChange={() => setActiveCategory(c.id)}>
                                    {c.name}
                                </Tag.CheckableTag>
                            ))}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <Row gutter={[12, 12]}>
                                {filteredMenu.map(m => (
                                    <Col span={8} key={m.id}>
                                        <div 
                                            onClick={() => handleAddItem(m)}
                                            style={{
                                                border: '1px solid #f0f0f0', borderRadius: 8, padding: 8, textAlign: 'center', cursor: 'pointer', background: '#fafafa', height: '100%'
                                            }}
                                        >
                                            <div style={{ height: 60, background: '#eee', borderRadius: 4, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {/* Ảnh giả định */}
                                                <Text type="secondary" style={{fontSize: 10}}>No Image</Text>
                                            </div>
                                            <Text strong style={{ fontSize: 13, display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{m.name}</Text>
                                            <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>{m.price?.toLocaleString()}đ</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    </Card>
                </Col>

                {/* CỘT 3: HÓA ĐƠN */}
                <Col span={8} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Card 
                        title={<><ShoppingCartOutlined /> {activeTable ? `Hóa đơn: ${activeTable.name}` : 'Chưa chọn bàn'}</>} 
                        size="small" 
                        style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 8 }}
                        bodyStyle={{ display: 'flex', flexDirection: 'column', padding: 0, flex: 1, overflow: 'hidden' }}
                    >
                        {loading && <div style={{ padding: 20, textAlign: 'center' }}>Đang tải...</div>}
                        {!loading && !activeOrder && (
                            <Empty description="Bàn này chưa có hóa đơn" style={{ marginTop: 50 }} />
                        )}
                        {!loading && activeOrder && (
                            <>
                                {/* Danh sách món */}
                                <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
                                    <List
                                        itemLayout="horizontal"
                                        dataSource={activeOrder.items || []}
                                        renderItem={item => (
                                            <div style={{ borderBottom: '1px dashed #eee', padding: '8px 0', display: 'flex', alignItems: 'center' }}>
                                                <div style={{ flex: 1 }}>
                                                    <Text strong>{item.menuItemName}</Text>
                                                    <div>{renderOrderStatus(item.note)} <Text type="secondary" style={{fontSize: 12}}>{item.unitPrice?.toLocaleString()}đ/món</Text></div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <InputNumber 
                                                        size="small" 
                                                        min={1} 
                                                        value={item.quantity} 
                                                        onChange={val => handleUpdateQuantity(item.id, val)}
                                                        disabled={item.note?.startsWith('COOKING') || item.note?.startsWith('COMPLETED')}
                                                        style={{ width: 50 }}
                                                    />
                                                    <Button 
                                                        type="text" 
                                                        danger 
                                                        icon={<DeleteOutlined />} 
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={item.note?.startsWith('COOKING') || item.note?.startsWith('COMPLETED')}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    />
                                </div>
                                
                                {/* Tổng kết & Thanh toán */}
                                <div style={{ borderTop: '1px solid #f0f0f0', padding: 16, background: '#fafafa' }}>
                                    <Row style={{ marginBottom: 4 }}><Col span={12}><Text>Tạm tính:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>{activeOrder.subTotal?.toLocaleString()} đ</Text></Col></Row>
                                    <Row style={{ marginBottom: 4 }}><Col span={12}><Text>Giảm giá:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>- {activeOrder.discount?.toLocaleString()} đ</Text></Col></Row>
                                    <Row style={{ marginBottom: 8 }}><Col span={12}><Text>Thuế:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>+ {activeOrder.tax?.toLocaleString()} đ</Text></Col></Row>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <Row style={{ marginBottom: 16 }}>
                                        <Col span={12}><Title level={4} style={{ margin: 0 }}>Thành tiền:</Title></Col>
                                        <Col span={12} style={{ textAlign: 'right' }}><Title level={3} style={{ margin: 0, color: '#d32f2f' }}>{activeOrder.totalAmount?.toLocaleString()} đ</Title></Col>
                                    </Row>
                                    <Row gutter={8}>
                                        <Col span={8}>
                                            <Button block icon={<PrinterOutlined />}>In HĐ</Button>
                                        </Col>
                                        <Col span={8}>
                                            <Button block type="primary" style={{ background: '#faad14', borderColor: '#faad14' }} icon={<FireOutlined />} onClick={handleSendKitchen}>Báo Bếp</Button>
                                        </Col>
                                        <Col span={8}>
                                            <Button block type="primary" icon={<DollarOutlined />} onClick={() => setIsPaymentOpen(true)}>Thanh toán</Button>
                                        </Col>
                                    </Row>
                                </div>
                            </>
                        )}
                    </Card>
                </Col>

            </Row>

            <PosPaymentModal open={isPaymentOpen} onCancel={() => setIsPaymentOpen(false)} onOk={handlePayment} loading={loading} order={activeOrder} />
        </div>
    );
};

export default POS;