import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, Drawer, List, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import recipeApi from '../../api/recipeApi';
import menuAdminApi from '../../api/menuAdminApi';
import RecipeModal from '../../components/admin/RecipeModal';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

const RecipeManagement = () => {
    const [recipes, setRecipes] = useState([]);
    const [menuCategories, setMenuCategories] = useState([]);
    const [availableMenuItems, setAvailableMenuItems] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', categoryId: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchRecipes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchDropdowns = async () => {
        try {
            const [catRes, ingRes] = await Promise.all([
                menuAdminApi.getCategories(),
                recipeApi.getIngredients()
            ]);
            if (catRes.success) setMenuCategories(catRes.data);
            if (ingRes.success) setIngredients(ingRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAvailableMenu = async () => {
        try {
            const res = await recipeApi.getAvailableMenuItems();
            if (res.success) setAvailableMenuItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize,
                ...filters, sortBy: sortOrder.field, sortDir: sortOrder.order
            };
            const res = await recipeApi.getRecipes(params);
            if (res.success) {
                setRecipes(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách công thức');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
    };

    const openCreateModal = async () => {
        await fetchAvailableMenu(); 
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleSubmitRecipe = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await recipeApi.updateRecipe(editingItem.id, values) : await recipeApi.createRecipe(values);
            if (res.success) {
                message.success('Lưu công thức thành công!');
                setIsModalOpen(false);
                fetchRecipes();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await recipeApi.deleteRecipe(id);
            if (res.success) {
                message.success('Đã xóa công thức');
                fetchRecipes();
            }
        } catch (error) {
            message.error('Lỗi khi xóa');
        }
    };

    const columns = [
        { title: 'Mã CT', dataIndex: 'recipeCode', key: 'recipeCode', width: 90, sorter: true },
        { 
            title: 'Món ăn', 
            key: 'menuItemName',
            render: (record) => <Text strong style={{ fontSize: '15px' }}>{record.menuItemName}</Text>
        },
        { 
            title: 'Danh mục món', 
            dataIndex: 'categoryName', 
            key: 'categoryName',
            render: (cat) => <Tag color="geekblue">{cat}</Tag>
        },
        { 
            title: 'Nguyên liệu', 
            key: 'itemsCount',
            render: (record) => <Tag color="blue">{record.items?.length || 0} mục</Tag>
        },
        { 
            title: 'Tổng giá vốn', 
            dataIndex: 'totalCost', 
            key: 'totalCost',
            sorter: true,
            render: (val) => <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{(val || 0).toLocaleString('vi-VN')} đ</span>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color={status === 'ACTIVE' ? 'success' : 'default'}>{status === 'ACTIVE' ? 'Đang áp dụng' : 'Ngừng'}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 160,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EyeOutlined />} onClick={() => { setEditingItem(record); setIsDetailOpen(true); }} style={{ color: '#52c41a' }} />
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title="Xóa công thức này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Công thức</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Công thức
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={12}>
                        <Input.Search placeholder="Tìm theo tên món hoặc nguyên liệu..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} enterButton={<SearchOutlined />} />
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Select placeholder="Lọc theo Danh mục món ăn" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, categoryId: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {menuCategories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={recipes} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} />
            </Card>

            <RecipeModal 
                open={isModalOpen} 
                onCancel={() => setIsModalOpen(false)} 
                onOk={handleSubmitRecipe} 
                loading={actionLoading} 
                editingItem={editingItem} 
                menuItems={availableMenuItems} 
                ingredients={ingredients} 
            />

            {/* View Detail Drawer */}
            <Drawer title={`Chi tiết Công thức: ${editingItem?.menuItemName || ''}`} placement="right" onClose={() => setIsDetailOpen(false)} open={isDetailOpen} width={500}>
                {editingItem && (
                    <>
                        <div style={{ marginBottom: 16 }}>
                            <Text type="secondary">Mã CT:</Text> <Text strong>{editingItem.recipeCode}</Text><br/>
                            <Text type="secondary">Ngày tạo:</Text> <Text>{editingItem.createdAt ? dayjs(editingItem.createdAt).format('DD/MM/YYYY HH:mm') : ''}</Text><br/>
                            <Text type="secondary">Ghi chú:</Text> <Text>{editingItem.note || 'Không có'}</Text>
                        </div>
                        <Divider>Thành phần nguyên liệu</Divider>
                        <List
                            itemLayout="horizontal"
                            dataSource={editingItem.items || []}
                            renderItem={item => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={<Text strong>{item.ingredientName} ({item.ingredientSku})</Text>}
                                        description={`${item.quantity} ${item.unit} x ${(item.unitCost || 0).toLocaleString('vi-VN')} đ`}
                                    />
                                    <div style={{ fontWeight: 'bold' }}>{(item.itemTotalCost || 0).toLocaleString('vi-VN')} đ</div>
                                </List.Item>
                            )}
                        />
                        <Divider />
                        <div style={{ textAlign: 'right' }}>
                            <Text style={{ fontSize: 16 }}>Tổng giá vốn: </Text>
                            <Text strong style={{ fontSize: 20, color: '#d32f2f' }}>{(editingItem.totalCost || 0).toLocaleString('vi-VN')} VNĐ</Text>
                        </div>
                    </>
                )}
            </Drawer>
        </div>
    );
};

export default RecipeManagement;