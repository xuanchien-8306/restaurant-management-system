import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Row, Col } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const InventoryModal = ({ open, onCancel, onOk, loading, editingItem, categories, suppliers }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    ...editingItem,
                    importDate: editingItem.importDate ? dayjs(editingItem.importDate) : null,
                    expiryDate: editingItem.expiryDate ? dayjs(editingItem.expiryDate) : null
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingItem, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const formatted = {
                ...values,
                importDate: values.importDate ? values.importDate.format('YYYY-MM-DD') : null,
                expiryDate: values.expiryDate ? values.expiryDate.format('YYYY-MM-DD') : null
            };
            onOk(formatted);
        });
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Nguyên liệu" : "Thêm Nguyên liệu mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={800}
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="sku" label="Mã nguyên liệu (SKU)" rules={[{ required: true }]}>
                            <Input placeholder="VD: NL-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="Tên nguyên liệu" rules={[{ required: true }]}>
                            <Input placeholder="VD: Thịt bò Wagyu" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="categoryId" label="Danh mục">
                            <Select placeholder="Chọn danh mục" allowClear>
                                {categories.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="supplierId" label="Nhà cung cấp">
                            <Select placeholder="Chọn NCC" allowClear>
                                {suppliers.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="unit" label="Đơn vị tính" rules={[{ required: true }]}>
                            <Input placeholder="VD: kg, lít, hộp" />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="importPrice" label="Giá nhập">
                            <InputNumber style={{ width: '100%' }} min={0} formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="minStock" label="Tồn tối thiểu">
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="importDate" label="Ngày nhập">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expiryDate" label="Hạn sử dụng">
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE" rules={[{ required: true }]}>
                    <Select>
                        <Option value="ACTIVE">Hoạt động</Option>
                        <Option value="DISABLED">Vô hiệu hóa</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default InventoryModal;