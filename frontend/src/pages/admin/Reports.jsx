import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, DatePicker, Button, Table, Typography, Space, Tag, message } from 'antd';
import { DollarOutlined, ShoppingCartOutlined, UserOutlined, FileExcelOutlined, FilePdfOutlined, SyncOutlined, FallOutlined, RiseOutlined, CalendarOutlined } from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/plots';
import dayjs from 'dayjs';
import reportApi from '../../api/reportApi';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
    const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [loading, setLoading] = useState(false);
    
    const [kpiData, setKpiData] = useState({});
    const [revenueData, setRevenueData] = useState([]);
    const [paymentData, setPaymentData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [inventoryWarning, setInventoryWarning] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const params = {
                start: dateRange[0].format('YYYY-MM-DDTHH:mm:ss'),
                end: dateRange[1].format('YYYY-MM-DDTHH:mm:ss')
            };

            const [kpi, rev, pay, stat, top, inv] = await Promise.all([
                reportApi.getKpi(params),
                reportApi.getRevenueChart({ ...params, groupBy: 'DAILY' }),
                reportApi.getPaymentMethods(params),
                reportApi.getOrderStatus(params),
                reportApi.getTopItems({ ...params, limit: 5 }),
                reportApi.getInventoryWarning()
            ]);

            if (kpi.success) setKpiData(kpi.data);
            if (rev.success) setRevenueData(rev.data);
            if (pay.success) setPaymentData(pay.data);
            if (stat.success) setStatusData(stat.data);
            if (top.success) setTopItems(top.data);
            if (inv.success) setInventoryWarning(inv.data);
            
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu báo cáo (Hãy kiểm tra Backend đang bật chưa)');
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        window.open(reportApi.getExcelExportUrl(dateRange[0].format('YYYY-MM-DDTHH:mm:ss'), dateRange[1].format('YYYY-MM-DDTHH:mm:ss')));
    };

    const handleExportPdf = () => {
        window.open(reportApi.getPdfExportUrl(dateRange[0].format('YYYY-MM-DDTHH:mm:ss'), dateRange[1].format('YYYY-MM-DDTHH:mm:ss')));
    };

    const lineConfig = {
        data: revenueData,
        xField: 'label',
        yField: 'value',
        point: { shapeField: 'circle', sizeField: 4 },
        interaction: { tooltip: { marker: false } },
        colorField: '#1890ff',
        axis: { y: { labelFormatter: (v) => `${(v / 1000000).toFixed(1)}M` } }
    };

    const pieConfig = {
        data: paymentData,
        angleField: 'value',
        colorField: 'label',
        innerRadius: 0.6,
        labels: [{ text: 'label', style: { fontSize: 12, fontWeight: 'bold' } }],
    };

    const columnConfig = {
        data: topItems.map(i => ({ name: i.itemName, qty: i.totalQuantity })),
        xField: 'name',
        yField: 'qty',
        colorField: '#52c41a',
        label: { text: (d) => d.qty, textBaseline: 'bottom' }
    };

    return (
        <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: 20 }}>
            <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
                <Col>
                    <Title level={3} style={{ margin: 0 }}>Báo cáo & Thống kê</Title>
                </Col>
                <Col>
                    <Space>
                        {/* FIX CẢNH BÁO: Dùng presets thay vì ranges */}
                        <RangePicker 
                            value={dateRange} 
                            onChange={val => setDateRange(val)} 
                            presets={[
                                { label: 'Hôm nay', value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                                { label: 'Tuần này', value: [dayjs().startOf('week'), dayjs().endOf('week')] },
                                { label: 'Tháng này', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
                                { label: 'Năm nay', value: [dayjs().startOf('year'), dayjs().endOf('year')] },
                            ]}
                        />
                        <Button icon={<SyncOutlined />} onClick={fetchDashboardData} loading={loading}>Làm mới</Button>
                        <Button type="primary" style={{ background: '#108ee9' }} icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button>
                        <Button type="primary" danger icon={<FilePdfOutlined />} onClick={handleExportPdf}>Xuất PDF</Button>
                    </Space>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* FIX CẢNH BÁO: Dùng variant="borderless" thay cho bordered={false}, dùng styles.content thay cho valueStyle */}
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic title="Tổng Doanh thu" value={kpiData.totalRevenue || 0} precision={0} prefix={<DollarOutlined />} suffix="đ" styles={{ content: { color: '#cf1322', fontWeight: 'bold' } }} />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">Tăng trưởng: </Text>
                            {kpiData.revenueGrowthRate >= 0 ? 
                                <Text type="success"><RiseOutlined /> {kpiData.revenueGrowthRate?.toFixed(2)}%</Text> : 
                                <Text type="danger"><FallOutlined /> {Math.abs(kpiData.revenueGrowthRate || 0)?.toFixed(2)}%</Text>
                            }
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic title="Lợi nhuận gộp" value={kpiData.totalProfit || 0} precision={0} prefix={<DollarOutlined />} suffix="đ" styles={{ content: { color: '#3f8600', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic title="Số Đơn Hàng" value={kpiData.totalOrders || 0} prefix={<ShoppingCartOutlined />} styles={{ content: { color: '#1890ff', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <Statistic title="Lượt Đặt Bàn" value={kpiData.totalReservations || 0} prefix={<CalendarOutlined />} styles={{ content: { color: '#722ed1', fontWeight: 'bold' } }} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="Biểu đồ Doanh thu" variant="borderless" style={{ borderRadius: 12 }}>
                        {revenueData.length > 0 ? <Line {...lineConfig} height={300} /> : <div style={{height: 300, textAlign: 'center', paddingTop: 130}}>Không có dữ liệu</div>}
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Phương thức thanh toán" variant="borderless" style={{ borderRadius: 12 }}>
                        {paymentData.length > 0 ? <Pie {...pieConfig} height={300} /> : <div style={{height: 300, textAlign: 'center', paddingTop: 130}}>Không có dữ liệu</div>}
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="Top 5 Món Bán Chạy Nhất" variant="borderless" style={{ borderRadius: 12 }}>
                        {topItems.length > 0 ? <Column {...columnConfig} height={250} /> : <div style={{textAlign: 'center', paddingTop: 100}}>Không có dữ liệu</div>}
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Cảnh báo Nguyên liệu (Sắp hết)" variant="borderless" style={{ borderRadius: 12 }}>
                        <Table 
                            dataSource={inventoryWarning} 
                            rowKey="ingredientId" 
                            pagination={false}
                            size="small"
                            scroll={{ y: 200 }}
                            columns={[
                                { title: 'Tên NL', dataIndex: 'ingredientName', key: 'name' },
                                { title: 'Tồn kho', dataIndex: 'currentStock', key: 'stock', render: (val, r) => <Text type="danger" strong>{val} {r.unit}</Text> },
                                { title: 'Mức Tối thiểu', dataIndex: 'minStockLevel', key: 'min', render: (val, r) => `${val} ${r.unit}` },
                                { title: 'Trạng thái', key: 'status', render: () => <Tag color="error">Sắp hết</Tag> }
                            ]}
                            locale={{ emptyText: 'Kho hàng an toàn' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Reports; 