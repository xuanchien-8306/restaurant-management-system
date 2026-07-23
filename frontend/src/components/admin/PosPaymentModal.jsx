import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, Typography, Divider } from 'antd';

const { Option } = Select;
const { Text, Title } = Typography;

const PosPaymentModal = ({ open, onCancel, onOk, loading, order }) => {
    const [form] = Form.useForm();
    const [finalTotal, setFinalTotal] = useState(0);
    const [changeAmount, setChangeAmount] = useState(0);

    const formDiscount = Form.useWatch('discount', form) || 0;
    const formTax = Form.useWatch('tax', form) || 0;
    const formTendered = Form.useWatch('amountTendered', form) || 0;

    useEffect(() => {
        if (open && order) {
            form.resetFields();
            form.setFieldsValue({
                paymentMethod: 'CASH',
                discount: order.discount || 0,
                tax: order.tax || 0,
                amountTendered: 0
            });
            setFinalTotal(order.totalAmount);
            setChangeAmount(0);
        }
    }, [open, order, form]);

    useEffect(() => {
        if (order) {
            const total = (order.subTotal || 0) - formDiscount + formTax;
            const validTotal = total > 0 ? total : 0;
            setFinalTotal(validTotal);
            setChangeAmount(formTendered > validTotal ? formTendered - validTotal : 0);
        }
    }, [formDiscount, formTax, formTendered, order]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    return (
        <Modal
            title="Thanh toán Hóa đơn"
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Hoàn tất Thanh toán"
            cancelText="Đóng"
            width={600}
            destroyOnClose
        >
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <Text type="secondary">Tổng cần thanh toán</Text>
                <Title level={2} style={{ color: '#d32f2f', margin: 0 }}>{finalTotal.toLocaleString('vi-VN')} đ</Title>
            </div>

            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="discount" label="Giảm giá / Voucher (VNĐ)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="tax" label="Thuế / Phụ thu (VNĐ)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Divider />

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="paymentMethod" label="Phương thức thanh toán" rules={[{ required: true }]}>
                            <Select>
                                <Option value="CASH">Tiền mặt</Option>
                                <Option value="TRANSFER">Chuyển khoản</Option>
                                <Option value="CARD">Thẻ ngân hàng</Option>
                                <Option value="QR">Quét mã QR</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="amountTendered" label="Khách đưa (VNĐ)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row style={{ background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                    <Col span={12}><Text strong style={{ fontSize: 16 }}>Tiền thừa trả khách:</Text></Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{changeAmount.toLocaleString('vi-VN')} đ</Text>
                    </Col>
                </Row>

                <Form.Item name="note" label="Ghi chú thanh toán" style={{ marginTop: 16 }}>
                    <Input.TextArea rows={2} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PosPaymentModal;