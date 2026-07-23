import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber } from 'antd';

const { Option } = Select;

const StockModal = ({ open, onCancel, onOk, loading, item }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (open) form.resetFields();
    }, [open, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => onOk(values));
    };

    return (
        <Modal
            title={`Giao dịch kho: ${item?.name || ''}`}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Form.Item name="type" label="Loại giao dịch" rules={[{ required: true }]}>
                    <Select placeholder="Chọn loại giao dịch">
                        <Option value="IMPORT">Nhập kho (Cộng thêm)</Option>
                        <Option value="EXPORT">Xuất kho (Trừ đi)</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="quantity" label={`Số lượng (${item?.unit || ''})`} rules={[{ required: true }]}>
                    <InputNumber style={{ width: '100%' }} min={0.01} step={0.1} />
                </Form.Item>
                <Form.Item name="note" label="Ghi chú/Lý do">
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default StockModal;