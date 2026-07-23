import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, Drawer, List, Divider, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, EyeOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import orderApi from '../../api/orderApi';
import OrderModal from '../../components/admin/OrderModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
    'PENDING': { color: 'default', label: 'Chờ xác nhận' },
    'COOKING': { color: 'processing', label: 'Đang chế biến' },
    'SERVED': { color: 'cyan', label: 'Đã phục vụ' },
    'COMPLETED': { color: 'success', label: 'Hoàn thành' },
    'CANCELLED': { color: 'error', label: 'Đã hủy' }
};

const TYPE_CONFIG = {
    'DINE_IN': { color: 'blue', label: 'Tại bàn' },
    'TAKEAWAY': { color: 'orange', label: 'Mang về' },
    'DELIVERY': { color: 'purple', label: 'Giao hàng' }
};

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [dependencies, setDependencies] = useState({});
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', status: null, orderType: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDependencies();
    }, []);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchDependencies = async () => {
        try {
            const res = await orderApi.getDependencies();
            if (res.success) setDependencies(res.data);
        } catch (error) {
            console.error('Lỗi tải dữ liệu phụ thuộc', error);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize,
                ...filters, sortBy: sortOrder.field, sortDir: sortOrder.order
            };
            const res = await orderApi.getOrders(params);
            if (res.success) {
                setOrders(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
    };

    const handleSubmitOrder = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await orderApi.updateOrder(editingItem.id, values) : await orderApi.createOrder(values);
            if (res.success) {
                message.success('Lưu đơn hàng thành công!');
                setIsModalOpen(false);
                fetchOrders();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelOrder = async (id) => {
        try {
            const res = await orderApi.cancelOrder(id);
            if (res.success) {
                message.success('Đã hủy đơn hàng');
                fetchOrders();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi hủy');
        }
    };

    const handleChangeStatus = async (id, status) => {
        try {
            const res = await orderApi.changeStatus(id, status);
            if (res.success) {
                message.success('Cập nhật trạng thái thành công');
                fetchOrders();
            }
        } catch (error) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    const getStatusMenu = (record) => (
        <Menu onClick={({ key }) => handleChangeStatus(record.id, key)}>
            {Object.keys(STATUS_CONFIG).map(k => (
                <Menu.Item key={k} disabled={record.status === 'COMPLETED' || record.status === 'CANCELLED'}>
                    {STATUS_CONFIG[k].label}
                </Menu.Item>
            ))}
        </Menu>
    );

    const columns = [
        { title: 'Mã ĐH', dataIndex: 'orderCode', key: 'orderCode', width: 100, sorter: true },
        { 
            title: 'Khách hàng', 
            key: 'customerName',
            render: (record) => <div><Text strong>{record.customerName}</Text><br/><Text type="secondary" style={{fontSize: 12}}>{record.tableName || 'Không dùng bàn'}</Text></div>
        },
        { 
            title: 'Loại', 
            dataIndex: 'orderType', 
            key: 'orderType',
            render: (type) => <Tag color={TYPE_CONFIG[type]?.color}>{TYPE_CONFIG[type]?.label}</Tag>
        },
        { 
            title: 'Tổng tiền', 
            dataIndex: 'totalAmount', 
            key: 'totalAmount',
            sorter: true,
            render: (val) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{(val || 0).toLocaleString('vi-VN')} đ</span>
        },
        { 
            title: 'Thời gian', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '')
        },
        { 
            title: 'Trạng thái', 
            key: 'status',
            render: (record) => (
                <Dropdown overlay={getStatusMenu(record)} trigger={['click']}>
                    <Tag color={STATUS_CONFIG[record.status]?.color} style={{ cursor: 'pointer' }}>
                        {STATUS_CONFIG[record.status]?.label} <SyncOutlined />
                    </Tag>
                </Dropdown>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => { setEditingItem(record); setIsDetailOpen(true); }} style={{ color: '#52c41a' }} />
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} disabled={record.status === 'COMPLETED' || record.status === 'CANCELLED'} />
                    <Popconfirm title="Xác nhận hủy đơn hàng này?" onConfirm={() => handleCancelOrder(record.id)} okText="Đồng ý" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<CloseCircleOutlined />} disabled={record.status === 'COMPLETED' || record.status === 'CANCELLED'} title="Hủy đơn" />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Đơn hàng</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Tạo Đơn hàng
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={10}>
                        <Input.Search placeholder="Tìm mã đơn, tên khách..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={7}>
                        <Select placeholder="Loại đơn" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, orderType: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {Object.keys(TYPE_CONFIG).map(k => <Option key={k} value={k}>{TYPE_CONFIG[k].label}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={7}>
                        <Select placeholder="Trạng thái" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {Object.keys(STATUS_CONFIG).map(k => <Option key={k} value={k}>{STATUS_CONFIG[k].label}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={orders} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} />
            </Card>

            <OrderModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitOrder} loading={actionLoading} editingItem={editingItem} dependencies={dependencies} />

            <Drawer title={`Chi tiết Đơn hàng: ${editingItem?.orderCode || ''}`} placement="right" onClose={() => setIsDetailOpen(false)} open={isDetailOpen} width={500}>
                {editingItem && (
                    <>
                        <Row style={{ marginBottom: 16 }}>
                            <Col span={12}><Text type="secondary">Khách hàng:</Text> <br/><Text strong>{editingItem.customerName}</Text></Col>
                            <Col span={12}><Text type="secondary">Bàn:</Text> <br/><Text strong>{editingItem.tableName || '-'}</Text></Col>
                            <Col span={12} style={{ marginTop: 8 }}><Text type="secondary">Loại đơn:</Text> <br/><Tag color={TYPE_CONFIG[editingItem.orderType]?.color}>{TYPE_CONFIG[editingItem.orderType]?.label}</Tag></Col>
                            <Col span={12} style={{ marginTop: 8 }}><Text type="secondary">Trạng thái:</Text> <br/><Tag color={STATUS_CONFIG[editingItem.status]?.color}>{STATUS_CONFIG[editingItem.status]?.label}</Tag></Col>
                            <Col span={24} style={{ marginTop: 8 }}><Text type="secondary">Ghi chú:</Text> <br/><Text>{editingItem.note || 'Không có'}</Text></Col>
                        </Row>
                        <Divider>Danh sách món ({editingItem.items?.length || 0})</Divider>
                        <List
                            itemLayout="horizontal"
                            dataSource={editingItem.items || []}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{item.menuItemName}</Text>}
                                        description={<div>SL: {item.quantity} x {(item.unitPrice || 0).toLocaleString()}đ <br/><Text type="secondary">{item.note}</Text></div>}
                                    />
                                    <div style={{ fontWeight: 'bold' }}>{(item.itemTotal || 0).toLocaleString('vi-VN')} đ</div>
                                </List.Item>
                            )}
                        />
                        <Divider />
                        <Row>
                            <Col span={12}><Text>Tạm tính:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>{(editingItem.subTotal || 0).toLocaleString()} đ</Text></Col>
                            <Col span={12}><Text>Giảm giá:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>- {(editingItem.discount || 0).toLocaleString()} đ</Text></Col>
                            <Col span={12}><Text>Thuế/Phí:</Text></Col><Col span={12} style={{ textAlign: 'right' }}><Text>+ {(editingItem.tax || 0).toLocaleString()} đ</Text></Col>
                        </Row>
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Text style={{ fontSize: 16 }}>Tổng thanh toán: </Text>
                            <Text strong style={{ fontSize: 24, color: '#d32f2f' }}>{(editingItem.totalAmount || 0).toLocaleString('vi-VN')} đ</Text>
                        </div>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default OrderManagement;