import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Tag, Popconfirm, message, Space, Card, Typography, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, StopOutlined, CheckCircleOutlined, SearchOutlined } from '@ant-design/icons';
import staffApi from '../../api/staffApi';
import StaffModal from '../../components/admin/StaffModal';

const { Title } = Typography;
const { Option } = Select;

const Staffs = () => {
    const [staffs, setStaffs] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    
    const [filters, setFilters] = useState({ keyword: '', roleId: null, status: null });
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        fetchStaffs();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.current, pagination.pageSize, filters]);

    const fetchRoles = async () => {
        try {
            const res = await staffApi.getStaffRoles();
            if (res.success) setRoles(res.data);
        } catch (error) {
            console.error('Fetch roles error:', error);
        }
    };

    const fetchStaffs = async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.current - 1,
                size: pagination.pageSize,
                keyword: filters.keyword,
                roleId: filters.roleId,
                status: filters.status
            };
            const res = await staffApi.getStaffs(params);
            if (res.success) {
                setStaffs(res.data.content);
                setPagination({ ...pagination, total: res.data.totalElements });
            }
        } catch (error) {
            message.error('Lỗi khi tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleSearch = (value) => {
        setFilters({ ...filters, keyword: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleRoleFilter = (value) => {
        setFilters({ ...filters, roleId: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusFilter = (value) => {
        setFilters({ ...filters, status: value });
        setPagination({ ...pagination, current: 1 });
    };

    const handleOpenModal = (staff = null) => {
        setEditingStaff(staff);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSubmitStaff = async (values) => {
        setModalLoading(true);
        try {
            let res;
            if (editingStaff) {
                res = await staffApi.updateStaff(editingStaff.id, values);
            } else {
                res = await staffApi.createStaff(values);
            }
            if (res.success) {
                message.success(editingStaff ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                handleCloseModal();
                fetchStaffs();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setModalLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await staffApi.toggleStatus(id);
            if (res.success) {
                message.success('Đã cập nhật trạng thái');
                fetchStaffs();
            }
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
        { 
            title: 'Nhân viên', 
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
            title: 'Chức vụ', 
            dataIndex: 'roleName', 
            key: 'roleName',
            render: (role) => <Tag color="blue">{role}</Tag>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'success' : 'error'}>
                    {status === 'ACTIVE' ? 'Đang làm việc' : 'Vô hiệu hóa'}
                </Tag>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size="middle">
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} style={{ color: '#1890ff' }} />
                    <Popconfirm 
                        title={record.status === 'ACTIVE' ? "Vô hiệu hóa nhân viên này?" : "Kích hoạt lại nhân viên này?"}
                        onConfirm={() => handleToggleStatus(record.id)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button 
                            type="text" 
                            icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />} 
                            danger={record.status === 'ACTIVE'}
                            style={{ color: record.status !== 'ACTIVE' ? '#52c41a' : undefined }}
                        />
                    </Popconfirm>
                </Space>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý Nhân sự</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ background: '#d32f2f', borderColor: '#d32f2f' }}>
                    Thêm Nhân viên
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: '12px', marginBottom: '20px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8} md={10}>
                        <Input.Search 
                            placeholder="Tìm theo tên, email, sđt..." 
                            allowClear 
                            enterButton={<SearchOutlined />}
                            onSearch={handleSearch}
                        />
                    </Col>
                    <Col xs={12} sm={8} md={7}>
                        <Select placeholder="Lọc theo Chức vụ" style={{ width: '100%' }} allowClear onChange={handleRoleFilter}>
                            {roles.map(r => <Option key={r.id} value={r.id}>{r.name}</Option>)}
                        </Select>
                    </Col>
                    <Col xs={12} sm={8} md={7}>
                        <Select placeholder="Lọc theo Trạng thái" style={{ width: '100%' }} allowClear onChange={handleStatusFilter}>
                            <Option value="ACTIVE">Đang làm việc</Option>
                            <Option value="DISABLED">Vô hiệu hóa</Option>
                        </Select>
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} style={{ borderRadius: '12px' }} bodyStyle={{ padding: '0' }}>
                <Table
                    columns={columns}
                    dataSource={staffs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                        showSizeChanger: true
                    }}
                    onChange={handleTableChange}
                />
            </Card>

            <StaffModal 
                open={isModalOpen}
                onCancel={handleCloseModal}
                onOk={handleSubmitStaff}
                loading={modalLoading}
                editingStaff={editingStaff}
                roles={roles}
            />
        </div>
    );
};

export default Staffs;