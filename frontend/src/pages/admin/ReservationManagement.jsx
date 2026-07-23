import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, DatePicker, Dropdown, Menu } from 'antd';
import { PlusOutlined, EditOutlined, SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, LoginOutlined, SyncOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import reservationApi from '../../api/reservationApi';
import ReservationModal from '../../components/admin/ReservationModal';

const { Title, Text } = Typography;
const { Option } = Select;

const STATUS_CONFIG = {
    'PENDING': { color: 'warning', label: 'Chờ xác nhận' },
    'CONFIRMED': { color: 'processing', label: 'Đã xác nhận' },
    'CHECKED_IN': { color: 'success', label: 'Đã Check-in' },
    'COMPLETED': { color: 'default', label: 'Hoàn thành' },
    'CANCELLED': { color: 'error', label: 'Đã hủy' },
    'NO_SHOW': { color: 'magenta', label: 'Không đến' }
};

const ReservationManagement = () => {
    const navigate = useNavigate();
    const [reservations, setReservations] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'reservationDate', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', status: null, date: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchReservations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize,
                ...filters, sortBy: sortOrder.field, sortDir: sortOrder.order,
                date: filters.date ? filters.date.format('YYYY-MM-DD') : null
            };
            const res = await reservationApi.getReservations(params);
            if (res.success) {
                setReservations(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách đặt bàn');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
    };

    const handleSubmitReservation = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await reservationApi.updateReservation(editingItem.id, values) : await reservationApi.createReservation(values);
            if (res.success) {
                message.success('Lưu thông tin thành công!');
                setIsModalOpen(false);
                fetchReservations();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeStatus = async (id, status) => {
        try {
            const res = await reservationApi.changeStatus(id, status);
            if (res.success) {
                message.success('Cập nhật trạng thái thành công');
                fetchReservations();
            }
        } catch (error) {
            message.error('Lỗi cập nhật trạng thái');
        }
    };

    const handleCheckIn = async (id) => {
        try {
            const res = await reservationApi.checkIn(id);
            if (res.success) {
                message.success(res.message);
                fetchReservations();
                navigate('/admin/pos'); // Tự động chuyển hướng sang POS
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi Check-in');
        }
    };

    const getStatusMenu = (record) => (
        <Menu onClick={({ key }) => handleChangeStatus(record.id, key)}>
            {Object.keys(STATUS_CONFIG).map(k => (
                <Menu.Item key={k} disabled={record.status === 'CANCELLED' || record.status === 'CHECKED_IN' || record.status === 'COMPLETED'}>
                    {STATUS_CONFIG[k].label}
                </Menu.Item>
            ))}
        </Menu>
    );

    const columns = [
        { title: 'Mã ĐB', dataIndex: 'reservationCode', key: 'reservationCode', width: 90, sorter: true },
        { 
            title: 'Khách hàng', 
            key: 'customer',
            render: (record) => <div><Text strong>{record.customerName}</Text><br/><Text type="secondary" style={{fontSize: 12}}>{record.customerPhone}</Text></div>
        },
        { 
            title: 'Bàn', 
            key: 'table',
            render: (record) => <><Text strong>{record.tableName}</Text> <br/><Text type="secondary" style={{fontSize: 12}}>{record.areaName}</Text></>
        },
        { title: 'Số khách', dataIndex: 'guestCount', key: 'guestCount', align: 'center' },
        { 
            title: 'Thời gian đến', 
            key: 'dateTime',
            sorter: true,
            render: (record) => (
                <div>
                    <Text strong style={{ color: '#d32f2f' }}>{record.reservationTime?.substring(0,5)}</Text> <br/>
                    <Text>{dayjs(record.reservationDate).format('DD/MM/YYYY')}</Text>
                </div>
            )
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
                    {(record.status === 'PENDING' || record.status === 'CONFIRMED') && (
                        <Popconfirm title="Xác nhận khách đã tới quán?" onConfirm={() => handleCheckIn(record.id)} okText="Check-in" cancelText="Hủy">
                            <Button type="primary" size="small" style={{ background: '#52c41a' }} icon={<LoginOutlined />} title="Check-in" />
                        </Popconfirm>
                    )}
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} disabled={record.status === 'CANCELLED' || record.status === 'CHECKED_IN' || record.status === 'COMPLETED'} />
                    {(record.status === 'PENDING' || record.status === 'CONFIRMED') && (
                        <Popconfirm title="Xác nhận hủy đặt bàn này?" onConfirm={() => handleChangeStatus(record.id, 'CANCELLED')} okText="Hủy bàn" cancelText="Đóng" okButtonProps={{ danger: true }}>
                            <Button type="text" danger icon={<CloseCircleOutlined />} title="Hủy bàn" />
                        </Popconfirm>
                    )}
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Đặt bàn</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Đặt bàn
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Input.Search placeholder="Tìm mã, tên, SĐT khách..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={8}>
                        <DatePicker placeholder="Lọc theo ngày" format="DD/MM/YYYY" style={{ width: '100%' }} onChange={val => { setFilters({ ...filters, date: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={8}>
                        <Select placeholder="Trạng thái" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {Object.keys(STATUS_CONFIG).map(k => <Option key={k} value={k}>{STATUS_CONFIG[k].label}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={reservations} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} />
            </Card>

            <ReservationModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitReservation} loading={actionLoading} editingItem={editingItem} />
        </div>
    );
};

export default ReservationManagement;