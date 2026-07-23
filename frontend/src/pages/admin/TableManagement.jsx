import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, Radio, Badge, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined, SwapOutlined, CompressOutlined, SplitCellsOutlined, SyncOutlined } from '@ant-design/icons';
import tableApi from '../../api/tableApi';
import TableModal from '../../components/admin/TableModal';
import TableActionModal from '../../components/admin/TableActionModal';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
    'AVAILABLE': { color: '#52c41a', label: 'Trống' },
    'RESERVED': { color: '#faad14', label: 'Đã đặt' },
    'IN_USE': { color: '#1890ff', label: 'Đang phục vụ' },
    'PAYING': { color: '#722ed1', label: 'Đang TT' },
    'CLEANING': { color: '#8c8c8c', label: 'Đang dọn' },
    'DISABLED': { color: '#f5222d', label: 'Ngừng HĐ' }
};

const TableManagement = () => {
    const [viewMode, setViewMode] = useState('GRID'); // GRID or TABLE
    const [tables, setTables] = useState([]);
    const [areas, setAreas] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
    const [filters, setFilters] = useState({ keyword: '', areaId: null, status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionMode, setActionMode] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    useEffect(() => {
        fetchTables();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchAreas = async () => {
        try {
            const res = await tableApi.getAreas();
            if (res.success) setAreas(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchTables = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize, ...filters
            };
            const res = await tableApi.getTables(params);
            if (res.success) {
                setTables(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách bàn');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitTable = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await tableApi.updateTable(editingItem.id, values) : await tableApi.createTable(values);
            if (res.success) {
                message.success('Lưu thông tin thành công!');
                setIsModalOpen(false);
                fetchTables();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleActionSubmit = async (payload, mode) => {
        setActionLoading(true);
        try {
            let res;
            if (mode === 'TRANSFER') res = await tableApi.transferTable(payload);
            if (mode === 'MERGE') res = await tableApi.mergeTables(payload);
            if (mode === 'SPLIT') res = await tableApi.splitTable(payload);
            
            if (res?.success) {
                message.success('Thao tác thành công!');
                setIsActionModalOpen(false);
                fetchTables();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Thao tác thất bại');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await tableApi.deleteTable(id);
            if (res.success) {
                message.success('Đã xóa bàn');
                fetchTables();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Không thể xóa bàn này');
        }
    };

    const handleChangeStatus = async (id, status) => {
        try {
            const res = await tableApi.changeStatus(id, status);
            if (res.success) {
                message.success('Đổi trạng thái thành công');
                fetchTables();
            }
        } catch (error) {
            message.error('Lỗi đổi trạng thái');
        }
    };

    const getStatusMenu = (record) => (
        <Menu onClick={({ key }) => handleChangeStatus(record.id, key)}>
            {Object.keys(STATUS_CONFIG).map(k => (
                <Menu.Item key={k}>
                    <Badge color={STATUS_CONFIG[k].color} text={STATUS_CONFIG[k].label} />
                </Menu.Item>
            ))}
        </Menu>
    );

    const columns = [
        { title: 'Mã bàn', dataIndex: 'tableCode', key: 'tableCode', width: 90 },
        { 
            title: 'Tên bàn', 
            key: 'name',
            render: (record) => <Text strong>{record.name}</Text>
        },
        { title: 'Khu vực', dataIndex: 'areaName', key: 'areaName' },
        { title: 'Sức chứa', dataIndex: 'capacity', key: 'capacity', align: 'center' },
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
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button type="text" icon={<SwapOutlined />} title="Chuyển bàn" onClick={() => { setEditingItem(record); setActionMode('TRANSFER'); setIsActionModalOpen(true); }} disabled={record.status === 'AVAILABLE'} />
                    <Button type="text" icon={<CompressOutlined />} title="Gộp bàn" onClick={() => { setEditingItem(record); setActionMode('MERGE'); setIsActionModalOpen(true); }} disabled={record.status !== 'IN_USE'} />
                    <Button type="text" icon={<SplitCellsOutlined />} title="Tách bàn" onClick={() => { setEditingItem(record); setActionMode('SPLIT'); setIsActionModalOpen(true); }} disabled={record.status !== 'IN_USE'} />
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title="Xóa bàn này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Bàn</Title>
                <Space>
                    <Radio.Group value={viewMode} onChange={e => setViewMode(e.target.value)}>
                        <Radio.Button value="GRID"><AppstoreOutlined /> Lưới</Radio.Button>
                        <Radio.Button value="TABLE"><UnorderedListOutlined /> Bảng</Radio.Button>
                    </Radio.Group>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                        Thêm Bàn
                    </Button>
                </Space>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={10}>
                        <Input.Search placeholder="Tìm mã bàn, tên bàn..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={7}>
                        <Select placeholder="Khu vực" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, areaId: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {areas.map(a => <Option key={a.id} value={a.id}>{a.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={7}>
                        <Select placeholder="Trạng thái" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {Object.keys(STATUS_CONFIG).map(k => <Option key={k} value={k}>{STATUS_CONFIG[k].label}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            {viewMode === 'TABLE' ? (
                <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                    <Table columns={columns} dataSource={tables} rowKey="id" loading={loading} pagination={{ ...pagination, onChange: (page, pageSize) => setPagination({ ...pagination, current: page, pageSize }) }} />
                </Card>
            ) : (
                <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
                    <Row gutter={[16, 16]}>
                        {tables.map(table => (
                            <Col xs={12} sm={8} md={6} lg={4} key={table.id}>
                                <Card 
                                    hoverable 
                                    bodyStyle={{ padding: '12px', textAlign: 'center', borderTop: `4px solid ${STATUS_CONFIG[table.status]?.color}` }}
                                    style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                                    onClick={() => { setEditingItem(table); setIsModalOpen(true); }}
                                >
                                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{table.name}</div>
                                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>{table.areaName} - {table.capacity} người</div>
                                    <Tag color={STATUS_CONFIG[table.status]?.color} style={{ margin: 0 }}>{STATUS_CONFIG[table.status]?.label}</Tag>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            <TableModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitTable} loading={actionLoading} editingItem={editingItem} areas={areas} />
            <TableActionModal open={isActionModalOpen} onCancel={() => setIsActionModalOpen(false)} onOk={handleActionSubmit} loading={actionLoading} sourceTable={editingItem} mode={actionMode} />
        </div>
    );
};

export default TableManagement;