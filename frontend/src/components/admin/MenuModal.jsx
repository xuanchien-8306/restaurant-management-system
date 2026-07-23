import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, Typography } from 'antd';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const MenuModal = ({ open, onCancel, onOk, loading, editingItem, categories }) => {
    const [form] = Form.useForm();
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    name: editingItem.name,
                    categoryId: editingItem.categoryId,
                    price: editingItem.price,
                    description: editingItem.description,
                    imageUrl: editingItem.imageUrl,
                    status: editingItem.status
                });
                setPreviewImage(editingItem.imageUrl || '');
            } else {
                form.resetFields();
                setPreviewImage('');
            }
        }
    }, [open, editingItem, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    const handleImageUrlChange = (e) => {
        setPreviewImage(e.target.value);
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Món ăn" : "Thêm Món ăn mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={750}
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <Form.Item name="name" label="Tên món ăn" rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}>
                            <Input placeholder="Nhập tên món ăn..." />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                                    <Select placeholder="Chọn danh mục">
                                        {categories.map(cat => (
                                            <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="price" label="Giá bán (VNĐ)" rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}>
                                    <InputNumber 
                                        style={{ width: '100%' }} 
                                        min={0} 
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="VD: 50,000" 
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item name="description" label="Mô tả món ăn">
                            <TextArea rows={3} placeholder="Nhập mô tả chi tiết nguyên liệu, hương vị..." />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} md={8}>
                        <Form.Item name="status" label="Trạng thái" initialValue="AVAILABLE" rules={[{ required: true }]}>
                            <Select>
                                <Option value="AVAILABLE">Đang bán</Option>
                                <Option value="UNAVAILABLE">Ngừng bán</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="imageUrl" label="URL Hình ảnh (Preview)">
                            <Input placeholder="https://..." onChange={handleImageUrlChange} />
                        </Form.Item>

                        <div style={{ 
                            width: '100%', 
                            height: '160px', 
                            border: '1px dashed #d9d9d9', 
                            borderRadius: '8px', 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            overflow: 'hidden',
                            backgroundColor: '#fafafa'
                        }}>
                            {previewImage ? (
                                <img src={previewImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Lỗi+Ảnh' }} />
                            ) : (
                                <Text type="secondary">Chưa có ảnh</Text>
                            )}
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default MenuModal;