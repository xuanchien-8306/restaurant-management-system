import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

const CategoryModal = ({ open, onCancel, onOk, loading, editingCategory }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingCategory) {
                form.setFieldsValue({
                    name: editingCategory.name,
                    description: editingCategory.description,
                    status: editingCategory.status
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingCategory, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    return (
        <Modal
            title={editingCategory ? "Cập nhật Danh mục" : "Thêm Danh mục mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Form.Item 
                    name="name" 
                    label="Tên danh mục" 
                    rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
                >
                    <Input placeholder="VD: Khai vị, Món chính..." />
                </Form.Item>

                <Form.Item name="description" label="Mô tả">
                    <TextArea rows={3} placeholder="Nhập mô tả cho danh mục..." />
                </Form.Item>

                <Form.Item 
                    name="status" 
                    label="Trạng thái" 
                    initialValue="ACTIVE" 
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Option value="ACTIVE">Hoạt động (ACTIVE)</Option>
                        <Option value="DISABLED">Ẩn (DISABLED)</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryModal;