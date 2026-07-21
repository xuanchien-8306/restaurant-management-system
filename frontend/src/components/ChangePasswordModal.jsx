import React, { useState } from 'react';
import { Modal, Form, Input, Button, message } from 'antd';
import customerService from '../services/customerService';

const ChangePasswordModal = ({ open, onClose }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await customerService.changePassword(values);
            if (res.success) {
                message.success('Đổi mật khẩu thành công!');
                form.resetFields();
                onClose();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Đổi mật khẩu"
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
            footer={null}
            destroyOnClose
        >
            <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: '20px' }}>
                <Form.Item 
                    name="currentPassword" 
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                >
                    <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item 
                    name="newPassword" 
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { 
                            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/, 
                            message: 'Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số' 
                        }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu mới" />
                </Form.Item>

                <Form.Item 
                    name="confirmPassword" 
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
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
                    <Input.Password placeholder="Nhập lại mật khẩu mới" />
                </Form.Item>

                <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#8b0000', borderColor: '#8b0000', marginTop: '10px' }}>
                    Xác Nhận Đổi
                </Button>
            </Form>
        </Modal>
    );
};

export default ChangePasswordModal;