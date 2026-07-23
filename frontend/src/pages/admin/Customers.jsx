import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, SearchOutlined } from '@ant-design/icons';
import customerAdminApi from '../../api/customerAdminApi';
import CustomerModal from '../../components/admin/CustomerModal';

const { Title } = Typography;
const { Option } = Select;

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize,
                keyword: filters.keyword,
                status: filters.status,
                sortBy: sortOrder.field,
                sortDir: sortOrder.order
            };
            const res = await customerAdminApi.getCustomers(params);
            if (res.success) {
                setCustomers(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách khách hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) {
            setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
        }
    };

    const handleSearch = (value) => {
        setFilters({ ...filters, keyword: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusFilter = (value) => {
        setFilters({ ...filters, status: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleSubmitCustomer = async (values) => {
        setModalLoading(true);
        try {
            let res;
            if (editingCustomer) {
                res = await customerAdminApi.updateCustomer(editingCustomer.id, values);
            } else {
                res = await customerAdminApi.createCustomer(values);
            }
            if (res.success) {
                message.success(editingCustomer ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                setEditingCustomer(null);
                fetchCustomers();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await customerAdminApi.toggleStatus(id);
            if (res.success) {
                message.success('Đã thay đổi trạng thái');
                fetchCustomers();
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await customerAdminApi.deleteCustomer(id);
            if (res.success) {
                message.success('Đã xóa khách hàng');
                fetchCustomers();
            }
        } catch (error) {
            message.error('Lỗi khi xóa khách hàng');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: true },
        { 
            title: 'Khách hàng', 
            key: 'info',
            render: (record) => (
                <div>
                    <div style={{ fontWeight: 'bold' }}>{record.fullName}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>@{record.username}</div>
                </div>
            )
        },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'SĐT', dataIndex: 'phone', key: 'phone' },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCustomer(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title={record.status === 'ACTIVE' ? "Khóa tài khoản này?" : "Mở khóa tài khoản này?"} onConfirm={() => handleToggleStatus(record.id)} okText="Đồng ý" cancelText="Hủy">
                        <Button type="text" icon={record.status === 'ACTIVE' ? <LockOutlined /> : <UnlockOutlined />} style={{ color: record.status !== 'ACTIVE' ? '#52c41a' : '#faad14' }} />
                    </Popconfirm>
                    <Popconfirm title="Chắc chắn xóa khách hàng này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Khách hàng</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCustomer(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Khách hàng
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={10}>
                        <Input.Search placeholder="Tìm theo tên, email, sđt..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select placeholder="Lọc theo Trạng thái" style={{ width: '100%' }} allowClear onChange={handleStatusFilter}>
                            <Option value="ACTIVE">Hoạt động</Option>
                            <Option value="DISABLED">Đã khóa</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={customers} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true }} />
            </Card>

            <CustomerModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitCustomer} loading={modalLoading} editingCustomer={editingCustomer} />
        </div>
    );
};

export default Customers;