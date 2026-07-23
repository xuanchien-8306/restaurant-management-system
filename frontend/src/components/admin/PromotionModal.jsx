import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Row, Col, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PromotionModal = ({ open, onCancel, onOk, loading, editingItem }) => {
    const [form] = Form.useForm();
    const promoType = Form.useWatch('promoType', form);
    const applyScope = Form.useWatch('applyScope', form);

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    ...editingItem,
                    dateRange: [dayjs(editingItem.startDate), dayjs(editingItem.endDate)],
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    promoType: 'PERCENTAGE',
                    applyScope: 'ALL',
                    status: 'ACTIVE'
                });
            }
        }
    }, [open, editingItem, form]);

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const payload = {
                ...values,
                startDate: values.dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                endDate: values.dateRange[1].format('YYYY-MM-DDTHH:mm:ss')
            };
            delete payload.dateRange;
            onOk(payload);
        });
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Khuyến mãi" : "Thêm Khuyến mãi mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={750}
            destroyOnClose
            maskClosable={false}
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="promoCode" label="Mã khuyến mãi" rules={[{ required: true, message: 'Nhập mã' }]}>
                            <Input placeholder="VD: TET2024" style={{ textTransform: 'uppercase' }} />
                        </Form.Item>
                    </Col>
                    <Col span={16}>
                        <Form.Item name="name" label="Tên chương trình" rules={[{ required: true, message: 'Nhập tên chương trình' }]}>
                            <Input placeholder="VD: Giảm 20% nhân dịp năm mới" />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="promoType" label="Loại giảm giá">
                            <Select>
                                <Option value="PERCENTAGE">Phần trăm (%)</Option>
                                <Option value="FIXED_AMOUNT">Tiền mặt (VNĐ)</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="discountValue" label="Giá trị giảm" rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="maxDiscountValue" label="Giảm tối đa (VNĐ)">
                            <InputNumber min={0} style={{ width: '100%' }} disabled={promoType !== 'PERCENTAGE'} placeholder="Không giới hạn" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="dateRange" label="Thời gian áp dụng" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                            <RangePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="minOrderValue" label="Giá trị đơn tối thiểu (VNĐ)">
                            <InputNumber min={0} style={{ width: '100%' }} placeholder="Không yêu cầu" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="usageLimit" label="Tổng lượt SD (0=Vô hạn)">
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="applyScope" label="Phạm vi áp dụng">
                            <Select>
                                <Option value="ALL">Toàn bộ hóa đơn</Option>
                                <Option value="CATEGORY">Danh mục món</Option>
                                <Option value="MENU_ITEM">Món ăn cụ thể</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="status" label="Trạng thái">
                            <Select>
                                <Option value="ACTIVE">Kích hoạt</Option>
                                <Option value="PAUSED">Tạm dừng</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {applyScope !== 'ALL' && (
                    <Form.Item name="applyScopeIds" label="ID Danh mục / Món ăn (Nhập ID cách nhau dấu phẩy)">
                        <Select mode="tags" placeholder="Nhập ID và ấn Enter..." style={{ width: '100%' }} />
                    </Form.Item>
                )}

                <Form.Item name="description" label="Mô tả / Điều kiện">
                    <Input.TextArea rows={2} placeholder="Nội dung chi tiết chương trình..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default PromotionModal;