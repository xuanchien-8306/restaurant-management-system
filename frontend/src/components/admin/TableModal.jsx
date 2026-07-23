import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col } from 'antd';

const { Option } = Select;

const TableModal = ({ open, onCancel, onOk, loading, editingItem, areas }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue(editingItem);
            } else {
                form.resetFields();
            }
        }
    }, [open, editingItem, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => onOk(values));
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Bàn" : "Thêm Bàn mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="tableCode" label="Mã bàn" rules={[{ required: true, message: 'Nhập mã bàn' }]}>
                            <Input placeholder="VD: B01, VIP-01" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="name" label="Tên bàn" rules={[{ required: true, message: 'Nhập tên bàn' }]}>
                            <Input placeholder="VD: Bàn 1, Bàn VIP 1" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="areaId" label="Khu vực" rules={[{ required: true, message: 'Chọn khu vực' }]}>
                            <Select placeholder="Chọn khu vực">
                                {areas.map(a => <Option key={a.id} value={a.id}>{a.name}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="capacity" label="Sức chứa (người)" initialValue={4} rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                <Form.Item name="status" label="Trạng thái" initialValue="AVAILABLE" rules={[{ required: true }]}>
                    <Select>
                        <Option value="AVAILABLE">Trống</Option>
                        <Option value="RESERVED">Đã đặt</Option>
                        <Option value="IN_USE">Đang phục vụ</Option>
                        <Option value="PAYING">Đang thanh toán</Option>
                        <Option value="CLEANING">Đang dọn</Option>
                        <Option value="DISABLED">Ngừng sử dụng</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default TableModal;