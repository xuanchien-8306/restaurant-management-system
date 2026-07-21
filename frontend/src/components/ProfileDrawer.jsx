import React, { useEffect, useState } from 'react';
import { Drawer, Form, Input, Button, DatePicker, Select, message, Spin, Row, Col, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import customerService from '../services/customerService';

const { Option } = Select;

const ProfileDrawer = ({ open, onClose, profile, setProfile }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && profile) {
            form.setFieldsValue({
                id: profile.id,
                username: profile.username,
                role: profile.role,
                createdAt: profile.createdAt ? dayjs(profile.createdAt).format('DD/MM/YYYY') : '',
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                gender: profile.gender,
                dob: profile.dob ? dayjs(profile.dob) : null,
                address: profile.address,
                avatar: profile.avatar
            });
        }
    }, [open, profile, form]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const payload = {
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                gender: values.gender,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
                address: values.address,
                avatar: values.avatar
            };
            const res = await customerService.updateProfile(payload);
            if (res.success) {
                message.success('Cập nhật hồ sơ thành công!');
                setProfile(res.data);
                onClose();
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    const disabledDate = (current) => {
        return current && current > dayjs().endOf('day');
    };

    return (
        <Drawer
            title="Hồ sơ cá nhân"
            width={500}
            onClose={onClose}
            open={open}
            styles={{ body: { paddingBottom: 80 } }}
            extra={<Button onClick={onClose}>Hủy</Button>}
        >
            <Spin spinning={loading}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <Avatar size={100} icon={<UserOutlined />} src={profile?.avatar} />
                </div>
                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="id" label="Mã KH">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="username" label="Tên đăng nhập">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Form.Item 
                        name="fullName" 
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ tên' },
                            { min: 2, max: 100, message: 'Từ 2 đến 100 ký tự' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item 
                                name="email" 
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không đúng định dạng' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item 
                                name="phone" 
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Phải gồm 10-11 số' }
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select placeholder="Chọn giới tính" allowClear>
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="dob" label="Ngày sinh">
                                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={disabledDate} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item 
                        name="address" 
                        label="Địa chỉ"
                        rules={[{ max: 255, message: 'Không vượt quá 255 ký tự' }]}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item name="avatar" label="URL Ảnh đại diện (Tuỳ chọn)">
                        <Input placeholder="https://..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="role" label="Vai trò">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="createdAt" label="Ngày tham gia">
                                <Input disabled />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Button type="primary" htmlType="submit" block size="large" style={{ background: '#8b0000', borderColor: '#8b0000' }}>
                        Lưu Thay Đổi
                    </Button>
                </Form>
            </Spin>
        </Drawer>
    );
};

export default ProfileDrawer;