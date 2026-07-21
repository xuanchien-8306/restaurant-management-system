import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';

const { Option } = Select;

const StaffModal = ({ open, onCancel, onOk, loading, editingStaff, roles }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingStaff) {
                form.setFieldsValue({
                    username: editingStaff.username,
                    fullName: editingStaff.fullName,
                    email: editingStaff.email,
                    phone: editingStaff.phone,
                    roleId: editingStaff.roleId,
                    status: editingStaff.status,
                    password: ''
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingStaff, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    return (
        <Modal
            title={editingStaff ? "Cập nhật Nhân viên" : "Thêm Nhân viên mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={600}
            destroyOnClose
        >
            <Form form={form} layout="vertical" className="staff-form" style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                    >
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[{ required: true, message: 'Vui lòng nhập username' }]}
                    >
                        <Input placeholder="Nhập username" disabled={!!editingStaff} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập SĐT' },
                            { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }
                        ]}
                    >
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item
                        name="roleId"
                        label="Vai trò (Role)"
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                    >
                        <Select placeholder="Chọn vai trò">
                            {roles.map(role => (
                                <Option key={role.id} value={role.id}>{role.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        initialValue="ACTIVE"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
                    >
                        <Select>
                            <Option value="ACTIVE">Đang làm việc (ACTIVE)</Option>
                            <Option value="DISABLED">Vô hiệu hóa (DISABLED)</Option>
                        </Select>
                    </Form.Item>
                </div>
                
                <Form.Item
                    name="password"
                    label={editingStaff ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                    rules={[{ required: !editingStaff, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password placeholder={editingStaff ? "Nhập mật khẩu mới..." : "Nhập mật khẩu (Mặc định: Rms@123456)"} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StaffModal;