import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, StopOutlined, CheckCircleOutlined, SearchOutlined, PictureOutlined } from '@ant-design/icons';
import menuAdminApi from '../../api/menuAdminApi';
import MenuModal from '../../components/admin/MenuModal';

const { Title } = Typography;
const { Option } = Select;

const MenuManagement = () => {
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', categoryId: null, status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchMenuItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchCategories = async () => {
        try {
            const res = await menuAdminApi.getCategories();
            if (res.success) setCategories(res.data);
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    const fetchMenuItems = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize,
                keyword: filters.keyword,
                categoryId: filters.categoryId,
                status: filters.status,
                sortBy: sortOrder.field,
                sortDir: sortOrder.order
            };
            const res = await menuAdminApi.getMenuItems(params);
            if (res.success) {
                setMenuItems(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách thực đơn');
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

    const handleSubmitMenu = async (values) => {
        setModalLoading(true);
        try {
            let res;
            if (editingItem) {
                res = await menuAdminApi.updateMenuItem(editingItem.id, values);
            } else {
                res = await menuAdminApi.createMenuItem(values);
            }
            if (res.success) {
                message.success(editingItem ? 'Cập nhật món ăn thành công!' : 'Thêm món mới thành công!');
                setIsModalOpen(false);
                setEditingItem(null);
                fetchMenuItems();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await menuAdminApi.toggleStatus(id);
            if (res.success) {
                message.success('Đã cập nhật trạng thái món ăn');
                fetchMenuItems();
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await menuAdminApi.deleteMenuItem(id);
            if (res.success) {
                message.success('Đã xóa món ăn khỏi thực đơn');
                fetchMenuItems();
            }
        } catch (error) {
            message.error('Lỗi khi xóa món ăn');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: true },
        { 
            title: 'Hình ảnh', 
            dataIndex: 'imageUrl', 
            key: 'imageUrl',
            width: 100,
            render: (url) => <Avatar shape="square" size={64} src={url} icon={<PictureOutlined />} />
        },
        { 
            title: 'Món ăn', 
            key: 'info',
            render: (record) => (
                <div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{record.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>SKU: {record.sku}</div>
                </div>
            )
        },
        { 
            title: 'Danh mục', 
            dataIndex: 'categoryName', 
            key: 'categoryName',
            render: (name) => <Tag color="geekblue">{name}</Tag>
        },
        { 
            title: 'Giá bán', 
            dataIndex: 'price', 
            key: 'price',
            sorter: true,
            render: (price) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{price.toLocaleString('vi-VN')} đ</span>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'AVAILABLE' ? 'success' : 'default'}>
                    {status === 'AVAILABLE' ? 'Đang bán' : 'Ngừng bán'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title={record.status === 'AVAILABLE' ? "Ngừng bán món này?" : "Mở bán lại món này?"} onConfirm={() => handleToggleStatus(record.id)} okText="Đồng ý" cancelText="Hủy">
                        <Button type="text" icon={record.status === 'AVAILABLE' ? <StopOutlined /> : <CheckCircleOutlined />} style={{ color: record.status !== 'AVAILABLE' ? '#52c41a' : '#faad14' }} />
                    </Popconfirm>
                    <Popconfirm title="Chắc chắn xóa món ăn này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Thực đơn</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Món ăn
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={10} md={10}>
                        <Input.Search placeholder="Tìm kiếm theo tên món ăn..." allowClear enterButton={<SearchOutlined />} onSearch={handleSearch} />
                    </Col>
                    <Col xs={12} sm={7} md={7}>
                        <Select placeholder="Lọc theo Danh mục" style={{ width: '100%' }} allowClear onChange={(val) => { setFilters({ ...filters, categoryId: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {categories.map(cat => (
                                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                            ))}
                        </Select>
                    </Col>
                    <Col xs={12} sm={7} md={7}>
                        <Select placeholder="Lọc theo Trạng thái" style={{ width: '100%' }} allowClear onChange={(val) => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            <Option value="AVAILABLE">Đang bán</Option>
                            <Option value="UNAVAILABLE">Ngừng bán</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={menuItems} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showSizeChanger: true }} />
            </Card>

            <MenuModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitMenu} loading={modalLoading} editingItem={editingItem} categories={categories} />
        </div>
    );
};

export default MenuManagement;