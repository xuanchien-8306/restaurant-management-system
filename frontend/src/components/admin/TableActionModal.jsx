import React, { useEffect, useState } from 'react';
import { Modal, Form, Select, Typography } from 'antd';
import tableApi from '../../api/tableApi';

const { Option } = Select;
const { Text } = Typography;

// mode: 'TRANSFER', 'MERGE', 'SPLIT'
const TableActionModal = ({ open, onCancel, onOk, loading, sourceTable, mode }) => {
    const [form] = Form.useForm();
    const [allTables, setAllTables] = useState([]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            fetchAllTables();
        }
    }, [open, form]);

    const fetchAllTables = async () => {
        try {
            const res = await tableApi.getAllTables();
            if (res.success) setAllTables(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = () => {
        form.validateFields().then(values => {
            const payload = {
                sourceTableId: mode !== 'MERGE' ? sourceTable?.id : null,
                sourceTableIds: mode === 'MERGE' ? [...values.sourceIds, sourceTable?.id] : null,
                targetTableId: mode === 'MERGE' ? sourceTable?.id : values.targetId
            };
            onOk(payload, mode);
        });
    };

    const getTitle = () => {
        if (mode === 'TRANSFER') return 'Chuyển bàn';
        if (mode === 'MERGE') return 'Gộp bàn';
        if (mode === 'SPLIT') return 'Tách bàn';
        return 'Thao tác bàn';
    };

    // Lọc bàn đích phù hợp (Trống hoặc Đang dọn)
    const availableTargets = allTables.filter(t => t.id !== sourceTable?.id && (t.status === 'AVAILABLE' || t.status === 'CLEANING'));
    // Lọc bàn nguồn phù hợp để gộp (Đang phục vụ)
    const availableSources = allTables.filter(t => t.id !== sourceTable?.id && t.status === 'IN_USE');

    return (
        <Modal
            title={getTitle()}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận"
            cancelText="Hủy"
            destroyOnClose
        >
            <div style={{ marginBottom: 16 }}>
                Bàn hiện tại: <Text strong style={{ color: '#1890ff' }}>{sourceTable?.name} - {sourceTable?.areaName}</Text>
            </div>
            
            <Form form={form} layout="vertical">
                {(mode === 'TRANSFER' || mode === 'SPLIT') && (
                    <Form.Item name="targetId" label="Chọn bàn đích" rules={[{ required: true, message: 'Vui lòng chọn bàn đích' }]}>
                        <Select placeholder="Chọn bàn trống" showSearch optionFilterProp="children">
                            {availableTargets.map(t => (
                                <Option key={t.id} value={t.id}>{t.name} ({t.areaName}) - Sức chứa: {t.capacity}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                {mode === 'MERGE' && (
                    <Form.Item name="sourceIds" label="Chọn bàn muốn gộp chung vào bàn này" rules={[{ required: true, message: 'Chọn ít nhất 1 bàn' }]}>
                        <Select mode="multiple" placeholder="Chọn các bàn đang phục vụ" showSearch optionFilterProp="children">
                            {availableSources.map(t => (
                                <Option key={t.id} value={t.id}>{t.name} ({t.areaName})</Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default TableActionModal;