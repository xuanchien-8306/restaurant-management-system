import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const CustomerModal = ({ open, onCancel, onOk, loading, editingCustomer }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingCustomer) {
                form.setFieldsValue({
                    username: editingCustomer.username,
                    fullName: editingCustomer.fullName,
                    email: editingCustomer.email,
                    phone: editingCustomer.phone,
                    gender: editingCustomer.gender,
                    dob: editingCustomer.dob ? dayjs(editingCustomer.dob) : null,
                    address: editingCustomer.address,
                    status: editingCustomer.status,
                    password: ''
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingCustomer, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const formattedValues = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null
            };
            onOk(formattedValues);
        });
    };

    return (
        <Modal
            title={editingCustomer ? "Cập nhật Khách hàng" : "Thêm Khách hàng mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={700}
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                        <Input placeholder="Nhập họ và tên" />
                    </Form.Item>

                    <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true, message: 'Vui lòng nhập username' }]}>
                        <Input placeholder="Nhập username" disabled={!!editingCustomer} />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input placeholder="Nhập email" />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }, { pattern: /^[0-9]{10,11}$/, message: 'SĐT không hợp lệ' }]}>
                        <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>

                    <Form.Item name="gender" label="Giới tính">
                        <Select placeholder="Chọn giới tính" allowClear>
                            <Option value="MALE">Nam</Option>
                            <Option value="FEMALE">Nữ</Option>
                            <Option value="OTHER">Khác</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="dob" label="Ngày sinh">
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={current => current && current > dayjs().endOf('day')} />
                    </Form.Item>
                </div>

                <Form.Item name="address" label="Địa chỉ">
                    <TextArea rows={2} placeholder="Nhập địa chỉ" />
                </Form.Item>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE" rules={[{ required: true }]}>
                        <Select>
                            <Option value="ACTIVE">Hoạt động (ACTIVE)</Option>
                            <Option value="DISABLED">Đã khóa (DISABLED)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="password" label={editingCustomer ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu"} rules={[{ required: !editingCustomer, message: 'Vui lòng nhập mật khẩu' }]}>
                        <Input.Password placeholder={editingCustomer ? "Nhập mật khẩu mới..." : "Nhập mật khẩu (Mặc định: Customer@123)"} />
                    </Form.Item>
                </div>
            </Form>
        </Modal>
    );
};

export default CustomerModal;