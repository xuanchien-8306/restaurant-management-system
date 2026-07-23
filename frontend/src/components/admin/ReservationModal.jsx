import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, Button, Row, Col, DatePicker, TimePicker, Alert } from 'antd';
import dayjs from 'dayjs';
import reservationApi from '../../api/reservationApi';

const { Option } = Select;

const ReservationModal = ({ open, onCancel, onOk, loading, editingItem }) => {
    const [form] = Form.useForm();
    const [availableTables, setAvailableTables] = useState([]);
    const [searchingTables, setSearchingTables] = useState(false);
    const [tableError, setTableError] = useState(null);

    const watchDate = Form.useWatch('reservationDate', form);
    const watchTime = Form.useWatch('reservationTime', form);
    const watchGuests = Form.useWatch('guestCount', form);

    useEffect(() => {
        if (open) {
            if (editingItem) {
                form.setFieldsValue({
                    ...editingItem,
                    reservationDate: dayjs(editingItem.reservationDate),
                    reservationTime: dayjs(editingItem.reservationTime, 'HH:mm:ss')
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, editingItem, form]);

    useEffect(() => {
        if (watchDate && watchTime) {
            fetchAvailableTables(watchDate, watchTime, watchGuests);
        } else {
            setAvailableTables([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchDate, watchTime, watchGuests]);

    const fetchAvailableTables = async (date, time, guests) => {
        setSearchingTables(true);
        setTableError(null);
        try {
            const params = {
                date: date.format('YYYY-MM-DD'),
                time: time.format('HH:mm:ss'),
                guestCount: guests || 1,
                currentId: editingItem?.id
            };
            const res = await reservationApi.getAvailableTables(params);
            if (res.success) {
                setAvailableTables(res.data);
                // Kiểm tra nếu bàn đang chọn không còn trong danh sách an toàn
                const currentTableId = form.getFieldValue('tableId');
                if (currentTableId && !res.data.find(t => t.id === currentTableId)) {
                    form.setFieldsValue({ tableId: null });
                    setTableError('Bàn bạn chọn trước đó đã có người đặt trong khung giờ này. Vui lòng chọn bàn khác!');
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearchingTables(false);
        }
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const payload = {
                ...values,
                reservationDate: values.reservationDate.format('YYYY-MM-DD'),
                reservationTime: values.reservationTime.format('HH:mm:ss')
            };
            onOk(payload);
        });
    };

    return (
        <Modal
            title={editingItem ? "Cập nhật Đặt bàn" : "Tạo Đặt bàn mới"}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu thông tin"
            cancelText="Hủy"
            width={700}
            destroyOnClose
            maskClosable={false}
        >
            <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="customerName" label="Tên khách hàng" rules={[{ required: true }]}>
                            <Input placeholder="Nhập tên khách..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="customerPhone" label="Số điện thoại" rules={[{ required: true }]}>
                            <Input placeholder="Nhập SĐT..." />
                        </Form.Item>
                    </Col>
                </Row>
                
                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item name="reservationDate" label="Ngày đặt" rules={[{ required: true }]}>
                            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" disabledDate={d => d && d < dayjs().startOf('day')} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="reservationTime" label="Giờ đặt" rules={[{ required: true }]}>
                            <TimePicker style={{ width: '100%' }} format="HH:mm" minuteStep={15} />
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item name="guestCount" label="Số lượng khách" initialValue={2} rules={[{ required: true }]}>
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="tableId" label="Chọn bàn (Tự động lọc bàn trống +- 2 tiếng)" rules={[{ required: true }]}>
                    <Select 
                        placeholder={(!watchDate || !watchTime) ? "Vui lòng chọn Ngày và Giờ trước" : "Chọn bàn trống..."} 
                        disabled={!watchDate || !watchTime}
                        loading={searchingTables}
                        showSearch
                        optionFilterProp="children"
                    >
                        {availableTables.map(t => (
                            <Option key={t.id} value={t.id}>{t.name} ({t.areaName}) - Sức chứa: {t.capacity}</Option>
                        ))}
                    </Select>
                </Form.Item>
                {tableError && <Alert message={tableError} type="error" showIcon style={{ marginBottom: 16 }} />}

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="status" label="Trạng thái" initialValue="PENDING">
                            <Select disabled={!editingItem}>
                                <Option value="PENDING">Chờ xác nhận</Option>
                                <Option value="CONFIRMED">Đã xác nhận</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="note" label="Ghi chú">
                            <Input.TextArea rows={1} placeholder="Ghi chú đặc biệt..." />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ReservationModal;