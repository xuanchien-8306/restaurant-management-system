import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, Tooltip, Drawer, Timeline } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, SwapOutlined, WarningOutlined, HistoryOutlined } from '@ant-design/icons';
import inventoryApi from '../../api/inventoryApi';
import InventoryModal from '../../components/admin/InventoryModal';
import StockModal from '../../components/admin/StockModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const InventoryManagement = () => {
    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [historyLogs, setHistoryLogs] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', categoryId: null, supplierId: null, status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchIngredients();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchDropdowns = async () => {
        try {
            const [catRes, supRes] = await Promise.all([
                inventoryApi.getCategories(),
                inventoryApi.getSuppliers()
            ]);
            if (catRes.success) setCategories(catRes.data);
            if (supRes.success) setSuppliers(supRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchIngredients = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize,
                ...filters, sortBy: sortOrder.field, sortDir: sortOrder.order
            };
            const res = await inventoryApi.getIngredients(params);
            if (res.success) {
                setIngredients(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải kho hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
    };

    const handleSubmitIngredient = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await inventoryApi.updateIngredient(editingItem.id, values) : await inventoryApi.createIngredient(values);
            if (res.success) {
                message.success('Lưu nguyên liệu thành công!');
                setIsModalOpen(false);
                fetchIngredients();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStockSubmit = async (values) => {
        setActionLoading(true);
        try {
            const res = await inventoryApi.processStock(editingItem.id, values);
            if (res.success) {
                message.success('Cập nhật kho thành công!');
                setIsStockModalOpen(false);
                fetchIngredients();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi xử lý kho');
        } finally {
            setActionLoading(false);
        }
    };

    const openHistory = async (record) => {
        setEditingItem(record);
        setIsHistoryOpen(true);
        try {
            const res = await inventoryApi.getHistory(record.id);
            if (res.success) setHistoryLogs(res.data);
        } catch (error) {
            message.error('Lỗi tải lịch sử');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await inventoryApi.deleteIngredient(id);
            if (res.success) {
                message.success('Đã xóa nguyên liệu');
                fetchIngredients();
            }
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    const columns = [
        { title: 'SKU', dataIndex: 'sku', key: 'sku', width: 90, sorter: true },
        { 
            title: 'Tên nguyên liệu', 
            key: 'name',
            render: (record) => (
                <div>
                    <Text strong>{record.name}</Text>
                    {record.isLowStock && <Tooltip title="Sắp hết hàng"><WarningOutlined style={{ color: '#faad14', marginLeft: 8 }} /></Tooltip>}
                    {record.isExpiring && <Tooltip title="Sắp hết hạn"><WarningOutlined style={{ color: '#f5222d', marginLeft: 8 }} /></Tooltip>}
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.categoryName}</div>
                </div>
            )
        },
        { title: 'NCC', dataIndex: 'supplierName', key: 'supplierName', ellipsis: true },
        { 
            title: 'Tồn kho', 
            key: 'stock',
            sorter: true,
            render: (record) => (
                <span style={{ color: record.isLowStock ? '#f5222d' : 'inherit', fontWeight: 'bold' }}>
                    {record.stockQuantity} {record.unit}
                </span>
            )
        },
        { 
            title: 'Giá nhập', 
            dataIndex: 'importPrice', 
            key: 'importPrice',
            render: (val) => val ? `${val.toLocaleString('vi-VN')} đ` : '-'
        },
        { 
            title: 'Hạn SD', 
            dataIndex: 'expiryDate', 
            key: 'expiryDate',
            render: (date, record) => (
                <span style={{ color: record.isExpiring ? '#f5222d' : 'inherit' }}>
                    {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
                </span>
            )
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Nhập/Xuất kho">
                        <Button type="text" icon={<SwapOutlined />} onClick={() => { setEditingItem(record); setIsStockModalOpen(true); }} style={{ color: '#fa8c16' }} />
                    </Tooltip>
                    <Tooltip title="Lịch sử">
                        <Button type="text" icon={<HistoryOutlined />} onClick={() => openHistory(record)} style={{ color: '#52c41a' }} />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    </Tooltip>
                    <Popconfirm title="Xóa nguyên liệu này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Kho hàng</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Nguyên liệu
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={6}>
                        <Input.Search placeholder="Tìm tên, mã SKU..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={6}>
                        <Select placeholder="Danh mục" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, categoryId: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Select placeholder="Nhà cung cấp" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, supplierId: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Select placeholder="Trạng thái" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            <Option value="ACTIVE">Hoạt động</Option>
                            <Option value="DISABLED">Ẩn</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={ingredients} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} />
            </Card>

            <InventoryModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitIngredient} loading={actionLoading} editingItem={editingItem} categories={categories} suppliers={suppliers} />
            <StockModal open={isStockModalOpen} onCancel={() => setIsStockModalOpen(false)} onOk={handleStockSubmit} loading={actionLoading} item={editingItem} />

            <Drawer title={`Lịch sử kho: ${editingItem?.name || ''}`} placement="right" onClose={() => setIsHistoryOpen(false)} open={isHistoryOpen} width={400}>
                <Timeline>
                    {historyLogs.map(log => (
                        <Timeline.Item key={log.id} color={log.logType === 'IMPORT' ? 'green' : 'red'}>
                            <p style={{ fontWeight: 'bold', margin: 0 }}>{log.logType === 'IMPORT' ? 'NHẬP KHO' : 'XUẤT KHO'}: {log.quantity}</p>
                            <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm')} - Bởi: {log.createdBy}</p>
                            {log.note && <p style={{ margin: 0 }}>Ghi chú: {log.note}</p>}
                        </Timeline.Item>
                    ))}
                    {historyLogs.length === 0 && <Text type="secondary">Chưa có lịch sử giao dịch</Text>}
                </Timeline>
            </Drawer>
        </div>
    );
};

export default InventoryManagement;