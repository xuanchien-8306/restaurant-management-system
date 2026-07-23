import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import profileApi from '../../api/profileApi';

const ChangePasswordModal = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            const res = await profileApi.changePassword(values);
            if (res.success) {
                message.success(res.message);
                form.resetFields();
                onSuccess(); // Trigger logout from parent
            }
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Đổi Mật Khẩu"
            open={open}
            onCancel={() => { form.resetFields(); onCancel(); }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận đổi"
            cancelText="Hủy"
            mask={{ closable: false }}
            destroyOnHidden
        >
            <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
                <Form.Item 
                    name="oldPassword" 
                    label="Mật khẩu hiện tại" 
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item 
                    name="newPassword" 
                    label="Mật khẩu mới" 
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, message: 'Tối thiểu 8 ký tự, gồm ít nhất 1 chữ và 1 số' }
                    ]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item 
                    name="confirmPassword" 
                    label="Xác nhận mật khẩu mới" 
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;