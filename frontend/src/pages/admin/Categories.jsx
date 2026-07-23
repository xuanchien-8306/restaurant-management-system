import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import categoryAdminApi from '../../api/categoryAdminApi';
import CategoryModal from '../../components/admin/CategoryModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchCategories = async () => {
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
            const res = await categoryAdminApi.getCategories(params);
            if (res.success) {
                setCategories(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách danh mục');
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

    const handleSubmitCategory = async (values) => {
        setModalLoading(true);
        try {
            let res;
            if (editingCategory) {
                res = await categoryAdminApi.updateCategory(editingCategory.id, values);
            } else {
                res = await categoryAdminApi.createCategory(values);
            }
            if (res.success) {
                message.success(editingCategory ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                setIsModalOpen(false);
                setEditingCategory(null);
                fetchCategories();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await categoryAdminApi.toggleStatus(id);
            if (res.success) {
                message.success('Đã cập nhật trạng thái');
                fetchCategories();
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await categoryAdminApi.deleteCategory(id);
            if (res.success) {
                message.success('Đã xóa danh mục');
                fetchCategories();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi xóa danh mục');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: true },
        { 
            title: 'Tên danh mục', 
            dataIndex: 'name', 
            key: 'name',
            render: (text) => <Text strong>{text}</Text>
        },
        { 
            title: 'Mô tả', 
            dataIndex: 'description', 
            key: 'description',
            ellipsis: true 
        },
        { 
            title: 'Số món ăn', 
            dataIndex: 'menuItemCount', 
            key: 'menuItemCount',
            align: 'center',
            render: (count) => <Tag color="blue">{count} món</Tag>
        },
        { 
            title: 'Ngày tạo', 
            dataIndex: 'createdAt', 
            key: 'createdAt',
            render: (date) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '')
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status === 'ACTIVE' ? 'Hoạt động' : 'Ẩn'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingCategory(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title={record.status === 'ACTIVE' ? "Ẩn danh mục này?" : "Hiện danh mục này?"} onConfirm={() => handleToggleStatus(record.id)} okText="Đồng ý" cancelText="Hủy">
                        <Button type="text" icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />} style={{ color: record.status !== 'ACTIVE' ? '#52c41a' : '#faad14' }} />
                    </Popconfirm>
                    <Popconfirm title="Chắc chắn xóa danh mục này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Danh mục</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCategory(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Danh mục
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={10}>
                        <Input.Search placeholder="Tìm theo tên danh mục..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select placeholder="Lọc theo Trạng thái" style={{ width: '100%' }} allowClear onChange={handleStatusFilter}>
                            <Option value="ACTIVE">Hoạt động</Option>
                            <Option value="DISABLED">Ẩn</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true }} />
            </Card>

            <CategoryModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitCategory} loading={modalLoading} editingCategory={editingCategory} />
        </div>
    );
};

export default Categories;  