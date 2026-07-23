import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col, Typography, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;

const OrderModal = ({ open, onCancel, onOk, loading, editingItem, dependencies }) => {
    const [form] = Form.useForm();
    const [totals, setTotals] = useState({ subTotal: 0, total: 0 });

    // BẢO VỆ CHỐNG SẬP: Đảm bảo luôn là mảng [] ngay cả khi API Backend lỗi hoặc trả về null
    const safeDependencies = dependencies || {};
    const tables = Array.isArray(safeDependencies.tables) ? safeDependencies.tables : [];
    const customers = Array.isArray(safeDependencies.customers) ? safeDependencies.customers : [];
    const menuItems = Array.isArray(safeDependencies.menuItems) ? safeDependencies.menuItems : [];

    // Thiết lập dữ liệu khởi tạo khi mở Modal
    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    ...editingItem,
                    items: Array.isArray(editingItem.items) ? editingItem.items.map(i => ({
                        menuItemId: i.menuItemId,
                        quantity: i.quantity,
                        note: i.note
                    })) : []
                });
                setTotals({ subTotal: editingItem.subTotal || 0, total: editingItem.totalAmount || 0 });
            } else {
                form.resetFields();
                form.setFieldsValue({ staffName: 'Admin', orderType: 'DINE_IN', discount: 0, tax: 0 });
                setTotals({ subTotal: 0, total: 0 });
            }
        }
    }, [open, editingItem, form]);

    // XỬ LÝ TÍNH TỔNG TIỀN AN TOÀN (Thay thế hoàn toàn cho Form.useWatch dễ gây lỗi)
    const handleValuesChange = (_, allValues) => {
        let sub = 0;
        if (Array.isArray(allValues.items)) {
            allValues.items.forEach(item => {
                if (item && item.menuItemId && item.quantity) {
                    const menu = menuItems.find(m => m && m.id === item.menuItemId);
                    if (menu) sub += (menu.price || 0) * item.quantity;
                }
            });
        }
        const discountVal = Number(allValues.discount) || 0;
        const taxVal = Number(allValues.tax) || 0;
        const finalTotal = sub - discountVal + taxVal;
        
        setTotals({ subTotal: sub, total: finalTotal > 0 ? finalTotal : 0 });
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Đơn hàng" : "Tạo Đơn hàng mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu Đơn hàng"
            cancelText="Hủy"
            width={900}
            destroyOnClose
            maskClosable={false}
        >
            <Form 
                form={form} 
                layout="vertical" 
                style={{ marginTop: '20px' }}
                onValuesChange={handleValuesChange} // Lắng nghe sự thay đổi của Form an toàn
            >
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="orderType" label="Loại đơn hàng" rules={[{ required: true }]}>
                            <Select>
                                <Option value="DINE_IN">Tại bàn</Option>
                                <Option value="TAKEAWAY">Mang về</Option>
                                <Option value="DELIVERY">Giao hàng</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="tableId" label="Chọn Bàn (Nếu ăn tại quán)">
                            <Select placeholder="Chọn bàn..." allowClear showSearch optionFilterProp="children">
                                {tables.map(t => t && <Option key={t.id} value={t.id}>{t.name} ({t.areaName})</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="customerId" label="Khách hàng (Tùy chọn)">
                            <Select placeholder="Khách vãng lai..." allowClear showSearch optionFilterProp="children">
                                {customers.map(c => c && <Option key={c.id} value={c.id}>{c.fullName || c.name} - {c.phone}</Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="staffName" label="Nhân viên tạo" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status" label="Trạng thái" initialValue="PENDING">
                            <Select disabled={!editingItem}>
                                <Option value="PENDING">Chờ xác nhận</Option>
                                <Option value="COOKING">Đang chế biến</Option>
                                <Option value="SERVED">Đã phục vụ</Option>
                                <Option value="COMPLETED">Hoàn thành</Option>
                                <Option value="CANCELLED">Đã hủy</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider orientation="left">Danh sách Món ăn</Divider>
                
                <Form.List name="items" rules={[{ validator: async (_, items) => { if (!items || items.length < 1) return Promise.reject(new Error('Phải có ít nhất 1 món')); } }]}>
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="start">
                                    <Form.Item {...restField} name={[name, 'menuItemId']} rules={[{ required: true, message: 'Chọn món' }]} style={{ width: 250 }}>
                                        <Select placeholder="Chọn món..." showSearch optionFilterProp="children">
                                            {menuItems.map(m => m && (
                                                <Option key={m.id} value={m.id}>{m.name} - {(m.price || 0).toLocaleString('vi-VN')}đ</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'quantity']} rules={[{ required: true, message: 'SL' }]}>
                                        <InputNumber placeholder="SL" min={1} style={{ width: 80 }} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'note']}>
                                        <Input placeholder="Ghi chú (Ít cay, không hành...)" style={{ width: 350 }} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: '18px', marginTop: '8px', cursor: 'pointer' }} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm món</Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="note" label="Ghi chú toàn bộ đơn hàng">
                            <Input.TextArea rows={3} placeholder="Ghi chú giao hàng, yêu cầu đặc biệt..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <div style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', border: '1px solid #d9d9d9' }}>
                            <Row style={{ marginBottom: '8px' }}>
                                <Col span={12}><Text>Tạm tính:</Text></Col>
                                <Col span={12} style={{ textAlign: 'right' }}><Text strong>{(totals?.subTotal || 0).toLocaleString('vi-VN')} đ</Text></Col>
                            </Row>
                            <Row style={{ marginBottom: '8px', alignItems: 'center' }}>
                                <Col span={12}><Text>Giảm giá (VNĐ):</Text></Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Form.Item name="discount" noStyle><InputNumber min={0} style={{ width: '100px' }} /></Form.Item>
                                </Col>
                            </Row>
                            <Row style={{ marginBottom: '16px', alignItems: 'center' }}>
                                <Col span={12}><Text>Thuế/Phí (VNĐ):</Text></Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Form.Item name="tax" noStyle><InputNumber min={0} style={{ width: '100px' }} /></Form.Item>
                                </Col>
                            </Row>
                            <Divider style={{ margin: '8px 0' }} />
                            <Row>
                                <Col span={12}><Title level={5} style={{ margin: 0 }}>Tổng thanh toán:</Title></Col>
                                <Col span={12} style={{ textAlign: 'right' }}>
                                    <Title level={4} style={{ margin: 0, color: '#d32f2f' }}>{(totals?.total || 0).toLocaleString('vi-VN')} đ</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default OrderModal;