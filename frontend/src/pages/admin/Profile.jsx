import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, DatePicker, Select, Row, Col, Typography, message, Upload, Avatar, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, UploadOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import profileApi from '../../api/profileApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Profile = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await profileApi.getProfile();
            if (res.success) {
                const data = res.data;
                setProfileData(data);
                setAvatarUrl(data.avatar);
                form.setFieldsValue({
                    ...data,
                    dob: data.dob ? dayjs(data.dob) : null
                });
            }
        } catch (error) {
            message.error('Không thể tải thông tin cá nhân');
        } finally {
            setFetching(false);
        }
    };

    const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

    const handleAvatarChange = async (info) => {
        const file = info.fileList[0]?.originFileObj || info.file;
        if (!file) return;
        
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Chỉ hỗ trợ file JPG/PNG!');
            return;
        }
        
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Ảnh phải nhỏ hơn 2MB!');
            return;
        }

        const base64 = await getBase64(file);
        setAvatarUrl(base64);
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const payload = {
                ...values,
                dob: values.dob ? values.dob.format('YYYY-MM-DD') : null,
                avatar: avatarUrl
            };
            const res = await profileApi.updateProfile(payload);
            if (res.success) {
                message.success('Cập nhật hồ sơ thành công!');
                // Update LocalStorage user info for Header display
                const currentUser = JSON.parse(localStorage.getItem('user')) || {};
                localStorage.setItem('user', JSON.stringify({ ...currentUser, fullName: payload.fullName, avatar: payload.avatar }));
                window.dispatchEvent(new Event('storage')); // Trigger header update
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div style={{ padding: 24 }}>Đang tải dữ liệu...</div>;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 0' }}>
            <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <Row gutter={32}>
                    {/* LEFT COLUMN - AVATAR & INFO */}
                    <Col xs={24} md={8} style={{ textAlign: 'center' }}>
                        <Avatar 
                            size={120} 
                            src={avatarUrl} 
                            icon={!avatarUrl && <UserOutlined />} 
                            style={{ marginBottom: 16, border: '2px solid #f0f0f0' }} 
                        />
                        <br />
                        <Upload 
                            showUploadList={false} 
                            beforeUpload={() => false} 
                            onChange={handleAvatarChange}
                        >
                            <Button icon={<UploadOutlined />}>Đổi ảnh đại diện</Button>
                        </Upload>
                        
                        <Divider />
                        
                        <div style={{ textAlign: 'left' }}>
                            <Text type="secondary">Tên đăng nhập:</Text>
                            <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>@{profileData?.username}</div>
                            
                            <Text type="secondary">Chức vụ:</Text>
                            <div style={{ marginBottom: 12 }}>
                                <Text strong style={{ color: '#1890ff' }}>
                                    <SafetyCertificateOutlined /> {profileData?.role}
                                </Text>
                            </div>

                            <Text type="secondary">Ngày tham gia:</Text>
                            <div style={{ fontWeight: 'bold' }}>
                                {profileData?.createdAt ? dayjs(profileData.createdAt).format('DD/MM/YYYY') : 'N/A'}
                            </div>
                        </div>
                    </Col>

                    {/* RIGHT COLUMN - FORM */}
                    <Col xs={24} md={16}>
                        <Title level={4} style={{ marginTop: 0, marginBottom: 24 }}>Thông tin cá nhân</Title>
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Row gutter={16}>
                                <Col span={24}>
                                    <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                        <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                                        <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="phone" label="Số điện thoại" rules={[{ pattern: /^[0-9]{10}$/, message: 'SDT gồm 10 chữ số' }]}>
                                        <Input prefix={<PhoneOutlined />} placeholder="09xxxxxxxx" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="gender" label="Giới tính">
                                        <Select placeholder="Chọn giới tính">
                                            <Option value="MALE">Nam</Option>
                                            <Option value="FEMALE">Nữ</Option>
                                            <Option value="OTHER">Khác</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Item name="dob" label="Ngày sinh">
                                        <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Form.Item name="address" label="Địa chỉ">
                                <Input.TextArea prefix={<HomeOutlined />} rows={3} placeholder="Số nhà, Đường, Quận/Huyện, Tỉnh/Thành phố" />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 32 }}>
                                <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ width: '100%', borderRadius: 8 }}>
                                    Lưu Thay Đổi
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default Profile;