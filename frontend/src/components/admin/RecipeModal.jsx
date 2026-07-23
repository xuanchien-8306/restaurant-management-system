import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Space, Row, Col, Typography, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text, Title } = Typography;

const RecipeModal = ({ open, onCancel, onOk, loading, editingItem, menuItems = [], ingredients = [] }) => {
    const [form] = Form.useForm();
    const [totalCost, setTotalCost] = useState(0);

    // Watchers để tính toán tự động
    const formItems = Form.useWatch('items', form);

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    menuItemId: editingItem.menuItemId,
                    note: editingItem.note,
                    status: editingItem.status,
                    // Bổ sung optional chaining (?) để chống sập nếu items bị rỗng
                    items: editingItem.items?.map(i => ({
                        ingredientId: i.ingredientId,
                        quantity: i.quantity
                    })) || []
                });
                setTotalCost(editingItem.totalCost || 0);
            } else {
                form.resetFields();
                setTotalCost(0);
            }
        }
    }, [open, editingItem, form]);

    // Tự động tính giá vốn khi danh sách items thay đổi
    useEffect(() => {
        if (formItems && ingredients.length > 0) {
            let sum = 0;
            formItems.forEach(item => {
                if (item && item.ingredientId && item.quantity) {
                    const ing = ingredients.find(i => i.id === item.ingredientId);
                    if (ing) {
                        sum += (ing.importPrice || 0) * item.quantity;
                    }
                }
            });
            setTotalCost(sum);
        } else {
            setTotalCost(0);
        }
    }, [formItems, ingredients]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            onOk(values);
        });
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Công thức" : "Thêm Công thức mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu công thức"
            cancelText="Hủy"
            width={850}
            destroyOnClose
            maskClosable={false}
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={16}>
                        <Form.Item 
                            name="menuItemId" 
                            label="Chọn Món ăn" 
                            rules={[{ required: true, message: 'Vui lòng chọn món ăn' }]}
                        >
                            <Select 
                                placeholder="Tìm kiếm và chọn món ăn..." 
                                showSearch 
                                optionFilterProp="children"
                                disabled={!!editingItem} // Không cho đổi món ăn khi sửa
                            >
                                {editingItem 
                                    ? <Option value={editingItem.menuItemId}>{editingItem.menuItemName}</Option>
                                    : menuItems.map(m => <Option key={m.id} value={m.id}>{m.name} ({m.sku})</Option>)
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status" label="Trạng thái" initialValue="ACTIVE">
                            <Select>
                                <Option value="ACTIVE">Đang áp dụng</Option>
                                <Option value="DISABLED">Ngừng áp dụng</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} orientation="left">Danh sách Nguyên liệu</Divider>
                
                <Form.List 
                    name="items" 
                    rules={[
                        {
                            validator: async (_, items) => {
                                if (!items || items.length < 1) {
                                    return Promise.reject(new Error('Phải có ít nhất 1 nguyên liệu'));
                                }
                                const ids = items.map(i => i?.ingredientId).filter(id => id);
                                if (new Set(ids).size !== ids.length) {
                                    return Promise.reject(new Error('Phát hiện nguyên liệu bị trùng lặp!'));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }, { errors }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'ingredientId']}
                                        rules={[{ required: true, message: 'Chọn nguyên liệu' }]}
                                        style={{ width: 350 }}
                                    >
                                        <Select placeholder="Chọn nguyên liệu..." showSearch optionFilterProp="children">
                                            {ingredients.map(ing => (
                                                <Option key={ing.id} value={ing.id}>
                                                    {ing.name} ({ing.unit}) - {(ing.importPrice || 0).toLocaleString('vi-VN')} đ
                                                </Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                    
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        rules={[{ required: true, message: 'Nhập SL' }]}
                                    >
                                        <InputNumber placeholder="Định lượng" min={0.001} step={0.1} style={{ width: 120 }} />
                                    </Form.Item>

                                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f', fontSize: '18px', paddingLeft: 8 }} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm nguyên liệu
                                </Button>
                                <Form.ErrorList errors={errors} />
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong style={{ fontSize: '16px' }}>Tổng giá vốn (Dự kiến):</Text>
                    <Title level={4} style={{ margin: 0, color: '#d32f2f' }}>
                        {(totalCost || 0).toLocaleString('vi-VN')} VNĐ
                    </Title>
                </div>

                <Form.Item name="note" label="Ghi chú chế biến">
                    <Input.TextArea rows={2} placeholder="Nhập ghi chú cho đầu bếp (nếu có)..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RecipeModal;