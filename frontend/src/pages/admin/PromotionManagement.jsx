import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import promotionApi from '../../api/promotionApi';
import PromotionModal from '../../components/admin/PromotionModal';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const STATUS_CONFIG = {
    'ACTIVE': { color: 'success', label: 'Đang chạy' },
    'PAUSED': { color: 'warning', label: 'Tạm dừng' },
    'EXPIRED': { color: 'default', label: 'Hết hạn' }
};

const PromotionManagement = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [sortOrder, setSortOrder] = useState({ field: 'id', order: 'DESC' });
    const [filters, setFilters] = useState({ keyword: '', promoType: null, status: null });
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchPromotions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters, sortOrder]);

    const fetchPromotions = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1, size: pagination.pageSize,
                ...filters, sortBy: sortOrder.field, sortDir: sortOrder.order
            };
            const res = await promotionApi.getPromotions(params);
            if (res.success) {
                setPromotions(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách KM');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination, tableFilters, sorter) => {
        setPagination(newPagination);
        if (sorter.field) setSortOrder({ field: sorter.field, order: sorter.order === 'ascend' ? 'ASC' : 'DESC' });
    };

    const handleSubmitPromotion = async (values) => {
        setActionLoading(true);
        try {
            const res = editingItem ? await promotionApi.updatePromotion(editingItem.id, values) : await promotionApi.createPromotion(values);
            if (res.success) {
                message.success('Lưu thành công!');
                setIsModalOpen(false);
                fetchPromotions();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setActionLoading(false);
        }
    };

    const handleChangeStatus = async (id, status) => {
        try {
            const res = await promotionApi.changeStatus(id, status);
            if (res.success) {
                message.success('Cập nhật trạng thái thành công');
                fetchPromotions();
            }
        } catch (error) {
            message.error('Lỗi cập nhật');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await promotionApi.deletePromotion(id);
            if (res.success) {
                message.success('Đã xóa khuyến mãi');
                fetchPromotions();
            }
        } catch (error) {
            message.error('Lỗi xóa');
        }
    };

    const columns = [
        { 
            title: 'Mã KM', 
            dataIndex: 'promoCode', 
            key: 'promoCode', 
            width: 120,
            render: (text) => <Text strong type="danger">{text}</Text>
        },
        { title: 'Tên chương trình', dataIndex: 'name', key: 'name' },
        { 
            title: 'Mức giảm', 
            key: 'discountValue',
            render: (_, r) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {r.discountValue.toLocaleString()} {r.promoType === 'PERCENTAGE' ? '%' : 'đ'}
                </Text>
            )
        },
        { 
            title: 'Thời gian', 
            key: 'time',
            render: (_, r) => (
                <div style={{ fontSize: 12 }}>
                    <Text type="success">{dayjs(r.startDate).format('DD/MM/YY HH:mm')}</Text> <br/>
                    <Text type="danger">{dayjs(r.endDate).format('DD/MM/YY HH:mm')}</Text>
                </div>
            )
        },
        { 
            title: 'Đã dùng', 
            key: 'usage',
            render: (_, r) => <Text>{r.usedCount} / {r.usageLimit || '∞'}</Text>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color={STATUS_CONFIG[status]?.color}>{STATUS_CONFIG[status]?.label}</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'ACTIVE' && <Button type="text" icon={<PauseCircleOutlined />} onClick={() => handleChangeStatus(record.id, 'PAUSED')} title="Tạm dừng" />}
                    {record.status === 'PAUSED' && <Button type="text" icon={<PlayCircleOutlined />} onClick={() => handleChangeStatus(record.id, 'ACTIVE')} title="Kích hoạt" style={{ color: '#52c41a' }}/>}
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingItem(record); setIsModalOpen(true); }} style={{ color: '#1890ff' }} />
                    <Popconfirm title="Xóa khuyến mãi này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Khuyến mãi</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); setIsModalOpen(true); }} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Khuyến mãi
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                        <Input.Search placeholder="Tìm mã hoặc tên chương trình..." onSearch={val => { setFilters({ ...filters, keyword: val }); setPagination({ ...pagination, current: 1 }); }} />
                    </Col>
                    <Col xs={12} sm={8}>
                        <Select placeholder="Loại khuyến mãi" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, promoType: val }); setPagination({ ...pagination, current: 1 }); }}>
                            <Option value="PERCENTAGE">Phần trăm (%)</Option>
                            <Option value="FIXED_AMOUNT">Tiền mặt</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={8}>
                        <Select placeholder="Trạng thái" style={{ width: '100%' }} allowClear onChange={val => { setFilters({ ...filters, status: val }); setPagination({ ...pagination, current: 1 }); }}>
                            {Object.keys(STATUS_CONFIG).map(k => <Option key={k} value={k}>{STATUS_CONFIG[k].label}</Option>)}
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table columns={columns} dataSource={promotions} rowKey="id" loading={loading} onChange={handleTableChange} pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} />
            </Card>

            <PromotionModal open={isModalOpen} onCancel={() => setIsModalOpen(false)} onOk={handleSubmitPromotion} loading={actionLoading} editingItem={editingItem} />
        </div>
    );
};

export default PromotionManagement;